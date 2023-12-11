import { React, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button } from '@mui/material';
import { axios } from '../api';
import TournamentInfo from './TournamentInfo';
import { getTournamentRequestData } from '../utils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultObject = {
    name: '',
    place: '',
    start_date: '',
    end_date: '',
    notes: '',
    is_team: false,
    power_ranking_kept: false,
};

export default function TournamentEditDialog(props) {
    const [tournament, setTournament] = useState(defaultObject);

    useEffect(() => {
        setTournament(props.selectedTournament);
    }, [JSON.stringify(props.tournaments), JSON.stringify(props.selectedTournament)]);

    function handleClose() {
        setTournament(defaultObject);
        props.setSelectedTournament(undefined);
        props.setOpen(false);
    }

    async function editTournament() {
        try {
            let data = getTournamentRequestData({ ...tournament });
            const response = await axios.patch(`/api/tournament/${props.selectedTournament?.id}`, data);
            if (response?.status === 200) {
                props.getTournaments();
                handleClose();
                toast.success('Sikeres mentés');
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Verseny adatok módosítása</Typography>
                <TournamentInfo tournament={tournament} setTournament={setTournament} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Mégse
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => editTournament()}>
                        Mentés
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
