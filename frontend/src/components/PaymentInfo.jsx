import { React } from 'react';
import { TextField, Grid, Autocomplete, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function PaymentInfo(props) {
    function datePicker(objectProperty, label) {
        return (
            <Grid container padding={'10px'}>
                <Grid item xs={12} paddingY={'5px'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} fullWidth>
                        <DatePicker
                            sx={{ width: '100%' }}
                            label={label}
                            value={props.payment[objectProperty]}
                            onChange={(newValue) => {
                                let copy = { ...props.payment };
                                copy[objectProperty] = new Date(newValue);
                                props.setPayment(copy);
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
        );
    }

    function textField(objectProperty, label, type) {
        return (
            <Grid container padding={'10px'}>
                <Grid item xs={12} paddingY={'5px'}>
                    <TextField
                        fullWidth
                        label={label}
                        type={type}
                        onChange={(e) => {
                            let copy = { ...props.payment };
                            copy[objectProperty] = e.target.value;
                            props.setPayment(copy);
                        }}
                        value={props.payment[objectProperty]}
                    />
                </Grid>
            </Grid>
        );
    }

    function autoComplete(objectProperty, label) {
        return (
            <Grid container padding={'10px'} justifyContent={'center'}>
                <Autocomplete
                    fullWidth
                    options={props?.players}
                    renderInput={(params) => <TextField {...params} label={label} />}
                    getOptionLabel={(option) => option.name ?? ''}
                    onChange={(event, newValue) => {
                        props.setPayment({ ...props.payment, player: newValue });
                    }}
                    value={props.payment.player || ''}
                />
            </Grid>
        );
    }

    return (
        <>
            {autoComplete('player', 'Játékos')}
            {props.create && (
                <Grid container padding={'10px'} justifyContent={'center'}>
                    <Typography>Utolsó fizetett időszak vége: {props.lastPayment} </Typography>
                </Grid>
            )}
            {datePicker('date', 'Befizetés ideje')}
            {datePicker('start', 'Fizetett időintervallum kezdete')}
            {datePicker('end', 'Fizetett időintervallum vége')}
            {textField('amount', 'Befizetett összeg')}
        </>
    );
}
