import { React } from 'react';
import { TextField, Grid, Typography, Switch, FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function PlayerInfo(props) {
    function textField(objectProperty, label, manyRows = false) {
        return (
            <Grid container padding={'10px'}>
                <Grid item xs={12} paddingY={'5px'}>
                    <TextField
                        fullWidth
                        label={label}
                        type={'text'}
                        onChange={(e) => {
                            let copy = { ...props.tournament };
                            copy[objectProperty] = e.target.value;
                            props.setTournament(copy);
                        }}
                        value={props.tournament[objectProperty]}
                        multiline={manyRows}
                        rows={5}
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
                            sx={{ width: '100%' }}
                            label={label}
                            value={new Date(props.tournament[objectProperty])}
                            onChange={(newValue) => {
                                let copy = { ...props.tournament };
                                copy[objectProperty] = new Date(newValue);
                                props.setTournament(copy);
                            }}
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
                                let copy = { ...props.tournament };
                                copy[objectProperty] = JSON.parse(e.target.value);
                                if (objectProperty === 'is_team' && e.target.value === 'false') {
                                    copy['power_ranking_kept'] = false;
                                }
                                props.setTournament(copy);
                            }}
                            value={props.tournament[objectProperty]}
                        >
                            <FormControlLabel value={false} control={<Radio />} label={option1} />
                            <FormControlLabel value={true} control={<Radio />} label={option2} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    function switchComponent(objectProperty, label) {
        return (
            <Grid container padding={'10px'} alignItems={'center'} justifyContent={'center'}>
                <Grid item pr={'10px'}>
                    <Typography>{label}:</Typography>
                </Grid>
                <Grid item>
                    <Switch
                        checked={props?.tournament[objectProperty]}
                        onChange={(e) => {
                            let copy = { ...props.tournament };
                            copy[objectProperty] = e.target.checked;
                            props.setTournament(copy);
                        }}
                    />
                </Grid>
            </Grid>
        );
    }

    if (!props.tournament) return;

    return (
        <>
            {textField('name', 'Név')}
            {textField('place', 'Helyszín')}
            {datePicker('start_date', 'Verseny kezdete')}
            {datePicker('end_date', 'Verseny vége')}

            {radio('is_team', 'Verseny típusa', 'Egyéni', 'Csapat')}
            {props?.tournament?.is_team === true
                ? switchComponent('power_ranking_kept', 'Tartani kell az erősorrendet', 'Igen', 'Nem')
                : null}
            {textField('notes', 'Egyéb információ', true)}
        </>
    );
}
