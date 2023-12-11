import { React } from 'react';
import { TextField, Grid, Typography, Radio, FormControl, FormControlLabel, RadioGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function PlayerInfo(props) {
    function textField(objectProperty, label, type) {
        return (
            <Grid container padding={'10px'}>
                <Grid item xs={12} paddingY={'5px'}>
                    <TextField
                        fullWidth
                        label={label}
                        type={type}
                        onChange={(e) => {
                            let copy = { ...props.player };
                            copy[objectProperty] = e.target.value;
                            props.setPlayer(copy);
                        }}
                        value={props.player[objectProperty]}
                    />
                </Grid>
            </Grid>
        );
    }

    function datePicker(objectProperty, label) {
        return (
            <Grid container padding={'10px'}>
                <Grid item xs={12} paddingY={'5px'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} fullWidth>
                        <DatePicker
                            label={label}
                            value={props.player[objectProperty]}
                            onChange={(newValue) => {
                                let copy = { ...props.player };
                                copy[objectProperty] = new Date(newValue);
                                props.setPlayer(copy);
                            }}
                            sx={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
        );
    }

    function radio(objectProperty, label, option1, option2) {
        return (
            <Grid container padding={'10px'} alignItems={'center'} justifyContent={'center'}>
                <Grid item pr={'10px'}>
                    <Typography>{label}:</Typography>
                </Grid>
                <Grid item>
                    <FormControl>
                        <RadioGroup
                            row
                            onChange={(e) => {
                                let copy = { ...props.player };
                                copy[objectProperty] = e.target.value;
                                props.setPlayer(copy);
                            }}
                        >
                            <FormControlLabel value={true} control={<Radio />} label={option1} />
                            <FormControlLabel value={false} control={<Radio />} label={option2} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    return (
        <>
            {textField('name', 'Név', 'text')}
            {textField('email', 'email', 'text')}
            {props.create && textField('password', 'Jelszó', 'password')}
            {textField('fide_id', 'FIDE azonosító', 'text')}
            {textField('komir_id', 'KOMIR azonosító', 'text')}
            {datePicker('birthdate', 'Születési idő')}
            {textField('birthplace', 'Születési hely', 'text')}
            {radio('is_male', 'Nem', 'Férfi', 'Nő')}
            {textField('address', 'Cím', 'text')}
            {textField('mother_name', 'Anyja neve', 'text')}
            {radio('is_staff', 'Admin', 'Igen', 'Nem')}
        </>
    );
}
