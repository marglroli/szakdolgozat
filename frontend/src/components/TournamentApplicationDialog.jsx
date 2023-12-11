import React, { Fragment, useEffect, useState, useMemo } from 'react';
import {
    Dialog,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Tab,
    Tabs,
    Autocomplete,
    IconButton,
} from '@mui/material';
import { axios } from '../api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TournamentApplicationDialog(props) {
    const [selectedValue, setSelectedValue] = useState('Jövök');
    const [otherText, setOtherText] = useState('');
    const [carCapacity, setCarCapacity] = useState(0);
    const [mode, setMode] = useState('regular');
    const [applications, setApplications] = useState([]);

    const applicationProp = useMemo(() => {
        let application = props?.selectedTournament?.applications?.find((appl) => appl?.player?.id === props.user?.id);
        if (application) {
            setSelectedValue(application?.status);
            return application;
        }
        return undefined;
    }, [JSON.stringify(props.tournaments), JSON.stringify(props.selectedTournament)]);

    useEffect(() => {
        if (selectedValue !== 'Egyéb' && otherText !== '') setOtherText('');
        if (selectedValue !== 'Jövök' && carCapacity !== 0) setCarCapacity(0);
    }, [selectedValue]);

    function handleClose() {
        //setTournament(defaultObject);
        props.setSelectedTournament(null);
        props.setOpen(false);
        setSelectedValue('Jövök');
    }

    useEffect(() => {
        setApplications(props.selectedTournament.applications);
    }, [JSON.stringify(props.selectedTournament.applications)]);

    async function submitData() {
        try {
            if (mode === 'regular') {
                if (applicationProp) {
                    const response = await axios.patch(`/api/tournament-application/${applicationProp?.id}`, {
                        status: selectedValue === 'Egyéb' ? otherText : selectedValue,
                        car_capacity: carCapacity,
                    });
                    if (response?.status === 200) {
                        handleClose();
                        toast.success('Sikeres mentés');
                        props.getTournaments();
                    }
                } else {
                    const response = await axios.post('/api/tournament-application/', {
                        tournament: props.selectedTournament?.id,
                        player: Number(props?.user?.id),
                        status: selectedValue === 'Egyéb' ? otherText : selectedValue,
                        car_capacity: carCapacity,
                    });
                    if (response?.status === 201) {
                        handleClose();
                        toast.success('Sikeres mentés');
                        props.getTournaments();
                    }
                }
            } else {
                const response = await axios.post('/api/admin-tournament-applications', {
                    id: props.selectedTournament.id,
                    applications: applications,
                });
                if (response.status === 200) {
                    toast.success('Sikeres mentés');
                    handleClose();
                    props.getTournaments();
                }
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen mentés');
        }
    }

    return (
        <Dialog open={props.open} maxWidth={'lg'}>
            {props.user?.is_staff && (
                <Grid container justifyContent={'center'}>
                    <Tabs
                        value={mode}
                        variant="scrollable"
                        onChange={(event, newValue) => setMode(newValue)}
                        textColor="secondary"
                        indicatorColor="secondary"
                    >
                        <Tab value="regular" label="Saját" />
                        <Tab value="admin" label="Játékosok" />
                    </Tabs>
                </Grid>
            )}
            {mode === 'regular' ? (
                <Grid container justifyContent={'center'} padding={'20px'}>
                    <Typography variant={'h5'}>Visszajelzés a versenyre</Typography>
                    <Grid container paddingY={'10px'}>
                        <FormControl fullWidth>
                            <InputLabel>Státusz</InputLabel>
                            <Select value={selectedValue} label="Státusz" onChange={(event) => setSelectedValue(event.target.value)}>
                                <MenuItem value={'Jövök'}>Jövök</MenuItem>
                                <MenuItem value={'Talán jövök'}>Talán jövök</MenuItem>
                                <MenuItem value={'Nem jövök'}>Nem jövök</MenuItem>
                                <MenuItem value={'Egyéb'}>Egyéb</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    {selectedValue === 'Egyéb' && (
                        <Grid container paddingY={'10px'}>
                            <TextField
                                fullWidth
                                type={'text'}
                                onChange={(e) => {
                                    setOtherText(e.target.value);
                                }}
                                value={otherText}
                            />
                        </Grid>
                    )}
                    {selectedValue === 'Jövök' && (
                        <Grid container paddingY={'10px'}>
                            <TextField
                                fullWidth
                                label={'Autó kapacitása (0, ha nem kíván azzal jönni)'}
                                type={'number'}
                                onChange={(e) => {
                                    setCarCapacity(e.target.value);
                                }}
                                value={carCapacity}
                            />
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Fragment>
                    {applications?.map((application, index) => (
                        <Grid container py={1} key={index} alignItems={'center'} sx={{ width: { xs: '100%', md: '800px', lg: '1200px' } }}>
                            <Grid item xs={6} p={1}>
                                <Autocomplete
                                    sx={{ width: '100%' }}
                                    options={props?.players}
                                    renderInput={(params) => <TextField {...params} label={'Játékos'} />}
                                    getOptionLabel={(option) => option.name ?? ''}
                                    onChange={(event, newValue) => {
                                        let copy = structuredClone(applications);
                                        copy[index]['player'] = newValue;
                                        setApplications(copy);
                                    }}
                                    value={application.player || ''}
                                />
                            </Grid>
                            <Grid item xs={5} sx={{ padding: 1 }}>
                                <TextField
                                    fullWidth
                                    label={'Státusz'}
                                    type={'text'}
                                    onChange={(e) => {
                                        let copy = structuredClone(applications);
                                        copy[index]['status'] = e.target.value;
                                        setApplications(copy);
                                    }}
                                    value={applications[index]['status']}
                                />
                            </Grid>
                            <Grid container item xs={1} justifyContent="center" p={1}>
                                <IconButton
                                    onClick={() => {
                                        let copy = structuredClone(applications);
                                        copy.splice(index, 1);
                                        setApplications(copy);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Grid container justifyContent={'center'}>
                        <IconButton
                            onClick={() => {
                                let copy = structuredClone(applications);
                                copy.push({ player: '', status: '' });
                                setApplications(copy);
                            }}
                        >
                            <AddIcon />
                        </IconButton>
                    </Grid>
                </Fragment>
            )}{' '}
            <Grid container padding={'20px'} justifyContent={'space-between'}>
                <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                    Mégse
                </Button>
                <Button color={'success'} variant={'contained'} onClick={() => submitData()}>
                    Mentés
                </Button>
            </Grid>
        </Dialog>
    );
}
