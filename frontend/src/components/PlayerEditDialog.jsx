import { React, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button } from '@mui/material';
import { axios } from '../api';
import PlayerInfo from './PlayerInfo';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultObject = {
    name: '',
    email: '',
    fide_id: '',
    komir_id: '',
    birthdate: new Date(),
    birthplace: '',
    address: '',
    is_male: true,
    mother_name: '',
    is_active: true,
    is_staff: false,
};
export default function PlayerEditDialog(props) {
    const [player, setPlayer] = useState(defaultObject);
    useEffect(() => {
        getPlayer();
    }, []);

    async function getPlayer() {
        try {
            const response = await axios.get('/api/player/' + props.playerId.current);
            if (response.status === 200) {
                response.data['birthdate'] = new Date(response.data['birthdate']);
                setPlayer(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const submitDisabled = useMemo(() => !player.name || !player.email);

    function handleClose() {
        setPlayer(defaultObject);
        props.setOpen(false);
        props.playerId.current = null;
    }

    useEffect(() => {}, [props.playerId]);

    async function editPlayer() {
        try {
            let copy = { ...player };
            let tmpDate = player.birthdate;
            let offset = tmpDate.getTimezoneOffset();
            tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
            copy['birthdate'] = tmpDate.toISOString().split('T')[0];

            const response = await axios.patch('/api/player/' + props.playerId.current, copy);
            if (response?.status === 200) {
                toast.success('Sikeres mentés');
                props.setOpen(false);
                setPlayer(defaultObject);
                props.getPlayers();
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Játékos adatainak módosítása</Typography>
                <PlayerInfo player={player} setPlayer={setPlayer} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} disabled={submitDisabled} variant={'contained'} onClick={() => editPlayer()}>
                        Módosítás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
