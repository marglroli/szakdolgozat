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

export default function PaymentEditDialog(props) {
    const [payment, setPayment] = useState(defaultObject);

    useEffect(() => {
        let copy = { ...props.open };
        copy['date'] = new Date(props.open?.date);
        copy['start'] = new Date(props.open?.start);
        copy['end'] = new Date(props.open?.end);
        setPayment(copy);
    }, [props.open]);

    function handleClose() {
        setPayment(defaultObject);
        props.setOpen(false);
    }

    async function editPayment() {
        const data = getPaymentRequestData(payment);
        try {
            const response = await axios.patch('/api/payment/' + payment?.id, data);
            if (response?.status === 200) {
                props.setOpen(false);
                setPayment(defaultObject);
                toast.success('Sikeres mentés');
                props.getPayments();
            }
        } catch (error) {
            toast.error('Sikeretelen mentés');
            console.log(error);
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Befizetés rögzítése</Typography>
                <PaymentInfo payment={payment} setPayment={setPayment} players={props.players} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => editPayment()}>
                        Mentés
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
