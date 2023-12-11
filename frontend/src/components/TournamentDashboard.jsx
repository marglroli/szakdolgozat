import { React, useState, useEffect, useRef, useMemo } from 'react';
import { Grid, Button, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteDialog from './DeleteDialog';
import TournamentCreateDialog from './TournamentCreateDialog';
import TournamentResultsDialog from './TournamentResultsDialog';
import TournamentApplicationDialog from './TournamentApplicationDialog';
import TournamentEditDialog from './TournamentEditDialog';
import { axios } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TournamentDashboard({ user, players }) {
    const [allTournaments, setAllTournaments] = useState([]);
    const [tournamentCreateDialogOpen, setTournamentCreateDialogOpen] = useState(false);
    const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tournamentEditDialogOpen, setTournamentEditDialogOpen] = useState(false);
    const [deleteQuestion, setDeleteQuestion] = useState('');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [tournamentResultDialogOpen, setTournamentResultDialogOpen] = useState(false);
    const [deleteDescription, setDeleteDescription] = useState('');
    const [mode, setMode] = useState('future');
    const selectedTournamentRef = useRef();
    const navigate = useNavigate();

    const today0000 = new Date().setHours(0, 0, 0);
    const today2359 = new Date().setHours(23, 59, 59);

    useEffect(() => {
        if (!localStorage.getItem('access_token')) {
            navigate('/login');
            return;
        }
        getTournaments();
    }, []);

    const tournaments = useMemo(() => {
        if (mode === 'past') {
            return allTournaments?.filter((tournament) => new Date(tournament?.start_date) <= today2359);
        } else {
            return allTournaments?.filter((tournament) => new Date(tournament?.start_date) >= today0000);
        }
    }, [allTournaments, mode]);

    async function getTournaments() {
        try {
            const response = await axios.get('/api/tournament');
            if (response?.status === 200) {
                setAllTournaments(response?.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function deleteTournament() {
        try {
            const response = await axios.delete(`/api/tournament/${selectedTournament?.id}`);
            if (response?.status === 204) {
                getTournaments();
                setSelectedTournament(null);
                toast.success('Sikeres törlés');
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen törlés');
        }
    }

    function getBackgroundColor(tournament) {
        {
            let status = tournament?.applications?.find((application) => application?.player?.id === user?.id)?.status;
            if (status === 'Jövök') return 'lightgreen';
            if (status === 'Nem jövök') return 'red';
            if (status) return 'yellow';
            return 'white';
        }
    }

    function getApplicantsWithStatus(tournament, status) {
        if (status !== 'Egyéb')
            return (
                <Typography variant="body2">
                    {tournament?.applications
                        ?.filter((application) => application?.status === status && application?.player?.id !== user?.id)
                        ?.map((application) => {
                            if (status === 'Jövök' && application?.car_capacity !== null && application?.car_capacity > 0) {
                                return (
                                    <div>
                                        {application?.rank ? `${application?.rank}.` : null} {application?.player?.name} -{' '}
                                        {application?.status} ({application?.car_capacity} fős autóval)
                                    </div>
                                );
                            } else {
                                return (
                                    <div>
                                        {application?.rank ? `${application?.rank}.` : null} {application?.player?.name} -{' '}
                                        {application?.status}
                                    </div>
                                );
                            }
                        })}
                </Typography>
            );
        return (
            <Typography variant="body2">
                {tournament?.applications
                    ?.filter(
                        (application) =>
                            application?.status !== 'Jövök' &&
                            application?.status !== 'Talán jövök' &&
                            application?.status !== 'Nem jövök' &&
                            application?.player !== user?.id
                    )
                    ?.map((application) => {
                        return `${application?.player?.name} - ${application?.status}`;
                    })}
            </Typography>
        );
    }

    return (
        <Grid container justifyContent={'center'}>
            {tournamentCreateDialogOpen && (
                <TournamentCreateDialog
                    open={tournamentCreateDialogOpen}
                    setOpen={setTournamentCreateDialogOpen}
                    getTournaments={getTournaments}
                />
            )}
            {tournamentEditDialogOpen && (
                <TournamentEditDialog
                    open={tournamentEditDialogOpen}
                    setOpen={setTournamentEditDialogOpen}
                    selectedTournament={selectedTournament}
                    setSelectedTournament={setSelectedTournament}
                    tournaments={tournaments}
                    getTournaments={getTournaments}
                />
            )}
            {applicationDialogOpen && (
                <TournamentApplicationDialog
                    open={applicationDialogOpen}
                    setOpen={setApplicationDialogOpen}
                    selectedTournament={selectedTournament}
                    setSelectedTournament={setSelectedTournament}
                    getTournaments={getTournaments}
                    user={user}
                    players={players}
                />
            )}
            {deleteDialogOpen && (
                <DeleteDialog
                    open={deleteDialogOpen}
                    setOpen={setDeleteDialogOpen}
                    deleteQuestion={deleteQuestion}
                    deleteAction={deleteTournament}
                    description={deleteDescription}
                />
            )}
            {tournamentResultDialogOpen && (
                <TournamentResultsDialog
                    players={players}
                    open={tournamentResultDialogOpen}
                    setOpen={setTournamentResultDialogOpen}
                    tournament={selectedTournamentRef.current}
                    user={user}
                />
            )}

            <Typography variant={'h4'}>
                Versenyek
                <IconButton>
                    <AddIcon onClick={() => setTournamentCreateDialogOpen(true)} />
                </IconButton>
            </Typography>
            <Grid container alignItems={'center'} justifyContent={'center'}>
                <Typography>Elmúlt</Typography>
                <Switch checked={mode === 'future'} onChange={(e) => (e.target.checked ? setMode('future') : setMode('past'))} />{' '}
                <Typography pr={'10px'}>Következő</Typography>
            </Grid>
            {tournaments?.map((tournament, index) => {
                return (
                    <Grid container justifyContent={'center'} key={index} paddingY={'20px'}>
                        <Accordion sx={{ maxWidth: 'lg', width: '100%', backgroundColor: getBackgroundColor(tournament) }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Grid container>
                                    <Typography variant={'h5'}>{tournament?.name}</Typography>
                                </Grid>
                                <Grid container>
                                    <Typography variant={'h6'}>
                                        {tournament?.start_date} - {tournament?.end_date}, {tournament?.place}
                                    </Typography>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container>
                                    <Grid item xs={12} md={6}>
                                        <Typography paddingY={'10px'}>
                                            Verseny típusa: {tournament?.is_team ? 'Csapat' : 'Egyéni'}
                                        </Typography>
                                        <Typography>Egyéb információk:</Typography>
                                        <Typography variant="body2"> {tournament?.notes}</Typography>
                                        <Typography paddingTop={'10px'}>
                                            Visszajelzésem:{' '}
                                            {tournament?.applications?.find((application) => application?.player?.id === user?.id)?.status}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography paddingTop={'10px'}>Mások visszajelzései</Typography>
                                        {getApplicantsWithStatus(tournament, 'Jövök')}
                                        {getApplicantsWithStatus(tournament, 'Talán jövök')}
                                        {getApplicantsWithStatus(tournament, 'Nem jövök')}
                                        {getApplicantsWithStatus(tournament, 'Egyéb')}
                                    </Grid>
                                </Grid>

                                <Grid container justifyContent={'flex-end'} spacing={2}>
                                    {mode === 'future' && (
                                        <Grid item>
                                            <Button
                                                variant={'contained'}
                                                onClick={() => {
                                                    setSelectedTournament(tournament);
                                                    setApplicationDialogOpen(true);
                                                }}
                                            >
                                                Visszajelzés
                                            </Button>
                                        </Grid>
                                    )}
                                    {user?.is_staff && (
                                        <Grid item>
                                            <Button
                                                variant={'contained'}
                                                onClick={() => {
                                                    setSelectedTournament(tournament);
                                                    setTournamentEditDialogOpen(true);
                                                }}
                                            >
                                                Adatok módosítása
                                            </Button>
                                        </Grid>
                                    )}
                                    {mode === 'past' && (
                                        <Grid item>
                                            <Button
                                                variant={'contained'}
                                                onClick={() => {
                                                    setTournamentResultDialogOpen(true);
                                                    selectedTournamentRef.current = tournament;
                                                }}
                                            >
                                                Eredmények
                                            </Button>
                                        </Grid>
                                    )}
                                    {user?.is_staff && (
                                        <Grid item>
                                            <Button
                                                variant={'contained'}
                                                color={'error'}
                                                onClick={() => {
                                                    setSelectedTournament(tournament);
                                                    setDeleteDialogOpen(true);
                                                    setDeleteQuestion('Biztos, hogy törölni szeretné a versenyt?');
                                                    setDeleteDescription(tournament.name);
                                                }}
                                            >
                                                Verseny törlése
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                );
            })}
        </Grid>
    );
}
