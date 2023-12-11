import { React, useMemo, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button } from '@mui/material';
import { axios } from '../api';
import PlayerInfo from './PlayerInfo';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const defaultObject = {
    name: '',
    email: '',
    password: '',
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
export default function PlayerCreateDialog(props) {
    const [player, setPlayer] = useState(defaultObject);

    function handleClose() {
        setPlayer(defaultObject);
        props.setOpen(false);
    }

    const submitDisabled = useMemo(() => !player?.name || !player?.email || !player?.password);

    async function createPlayer() {
        try {
            let copy = { ...player };
            let tmpDate = player.birthdate;
            let offset = tmpDate.getTimezoneOffset();
            tmpDate = new Date(tmpDate.getTime() - offset * 60 * 1000);
            copy['birthdate'] = tmpDate.toISOString().split('T')[0];

            const response = await axios.post('/api/register/', copy);

            if (response?.status === 200) {
                props.setOpen(false);
                setPlayer(defaultObject);
                toast.success('Sikeres mentés');
                props.getPlayers();
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen mentés');
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Játékos hozzáadása</Typography>
                <PlayerInfo player={player} setPlayer={setPlayer} create={true} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} disabled={submitDisabled} variant={'contained'} onClick={() => createPlayer()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
