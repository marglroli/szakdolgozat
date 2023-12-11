import { React, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button, Autocomplete, TextField } from '@mui/material';
import { axios } from '../api';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultObject = {
    item: null,
    player: {},
    count: 1,
    startDate: new Date(),
};

export default function LendingCreateDialog(props) {
    const [lending, setLending] = useState(defaultObject);

    function handleClose() {
        setLending(defaultObject);
        props.setOpen(false);
    }

    async function createLending() {
        const data = {
            item: lending.item.id,
            player: lending.player.id,
            count: lending.count,
        };
        const offset = lending.startDate.getTimezoneOffset();
        let tmpDate = new Date(lending.startDate.getTime() - offset * 60 * 1000);
        data['start_date'] = tmpDate.toISOString().split('T')[0];
        try {
            const response = await axios.post('/api/lending/', data);
            if (response?.status === 201) {
                props.setOpen(false);
                toast.success('Sikeres mentés');
                setLending(defaultObject);
                props.getItems();
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Grid container justifyContent={'center'}>
                    <Typography variant={'h5'}>Kölcsönzés felvétele</Typography>
                </Grid>
                <Grid container padding={'10px'} justifyContent={'center'}>
                    <Autocomplete
                        fullWidth
                        options={props?.players}
                        renderInput={(params) => <TextField {...params} label="Kölcsönző neve" />}
                        getOptionLabel={(option) => option.name ?? ''}
                        onChange={(event, newValue) => {
                            setLending({ ...lending, player: newValue });
                        }}
                        value={lending.player}
                    />
                </Grid>

                <Grid container padding={'10px'} justifyContent={'center'}>
                    <Autocomplete
                        fullWidth
                        options={props?.items}
                        renderInput={(params) => <TextField {...params} label="Eszköz neve" />}
                        getOptionLabel={(option) => option.name ?? ''}
                        onChange={(event, newValue) => {
                            setLending({ ...lending, item: newValue });
                        }}
                        value={lending.item}
                    />
                </Grid>

                <Grid container padding={'10px'}>
                    <TextField
                        sx={{ width: '100%' }}
                        label={'Darabszám'}
                        type={'number'}
                        onChange={(e) => {
                            setLending({ ...lending, count: Number(e.target.value) });
                        }}
                        value={lending.count}
                    />
                </Grid>
                <Grid container padding={'10px'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} fullWidth>
                        <DatePicker
                            sx={{ width: '100%' }}
                            label={'Kölcsönzés dátuma'}
                            value={new Date(lending.startDate)}
                            onChange={(newValue) => {
                                setLending({ ...lending, startDate: newValue });
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => createLending()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
