import { React, useState } from 'react';
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

export default function TournamentCreateDialog(props) {
    const [tournament, setTournament] = useState(defaultObject);

    function handleClose() {
        setTournament(defaultObject);
        props.setOpen(false);
    }

    async function createTournament() {
        try {
            let data = getTournamentRequestData({ ...tournament });
            const response = await axios.post('/api/tournament/', data);
            if (response?.status === 201) {
                props.setOpen(false);
                setTournament(defaultObject);
                props.getTournaments();
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
                <Typography variant={'h5'}>Verseny létrehozása</Typography>
                <TournamentInfo tournament={tournament} setTournament={setTournament} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => createTournament()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
