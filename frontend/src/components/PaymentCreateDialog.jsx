import { React, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button } from '@mui/material';
import { axios } from '../api';
import PaymentInfo from './PaymentInfo';
import { getPaymentRequestData } from '../utils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultObject = {
    player: {},
    date: new Date(),
    start: new Date(),
    end: new Date(),
    amount: 0,
};

export default function PaymentCreateDialog(props) {
    const [payment, setPayment] = useState(defaultObject);
    const [lastPayment, setLastPayment] = useState();

    function handleClose() {
        setPayment(defaultObject);
        props.setOpen(false);
    }

    async function createPayment() {
        const data = getPaymentRequestData(payment);
        try {
            const response = await axios.post('/api/payment/', data);
            if (response?.status === 201) {
                props.setOpen(false);
                setPayment(defaultObject);
                props.getPayments();
                toast.success('Sikeres mentés');
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen mentés');
        }
    }

    async function getLastPayment(id) {
        try {
            const response = await axios.post('/api/last-payment', { id: id });
            setLastPayment(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (payment?.player?.id) getLastPayment(payment?.player?.id);
    }, [payment?.player]);

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Befizetés rögzítése</Typography>
                <PaymentInfo payment={payment} setPayment={setPayment} players={props.players} lastPayment={lastPayment} create={true} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => createPayment()}>
                        Mentés
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
