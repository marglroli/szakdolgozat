import React, { Fragment, useEffect, useState } from 'react';
import { Grid, Typography, Dialog, IconButton, Autocomplete, Button, TextField, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { axios } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TournamentResultsDialog(props) {
    const [results, setResults] = useState([]);
    const [mode, setMode] = useState('list');

    useEffect(() => {
        getResults();
    }, []);

    async function saveChanges() {
        try {
            const response = await axios.post('/api/tournament-results', { results: results, id: props.tournament.id });
            if (response.status === 200) {
                toast.success('Sikeres mentés');
                props.setOpen(false);
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    async function getResults() {
        try {
            const response = await axios.post('/api/get-tournament-results', { id: props.tournament.id });
            if (response.status === 200) {
                setResults(response.data);
            }
        } catch (error) {}
    }

    function update() {
        return (
            <Fragment>
                {results?.map((result, index) => (
                    <Grid container py={1} key={index} alignItems={'center'} sx={{ width: { xs: '100%', md: '800px', lg: '1200px' } }}>
                        <Autocomplete
                            sx={{ width: '50%', padding: 2 }}
                            options={props?.players}
                            renderInput={(params) => <TextField {...params} label={'Játékos'} />}
                            getOptionLabel={(option) => option.name ?? ''}
                            onChange={(event, newValue) => {
                                let copy = structuredClone(results);
                                copy[index]['player'] = newValue;
                                setResults(copy);
                            }}
                            value={result.player || ''}
                        />
                        <Grid item p={2}>
                            <TextField
                                label={'Kategória'}
                                type={'text'}
                                onChange={(e) => {
                                    let copy = structuredClone(results);
                                    copy[index]['category'] = e.target.value;
                                    setResults(copy);
                                }}
                                value={results[index]['category']}
                            />
                        </Grid>
                        <Grid item p={2}>
                            <TextField
                                label={'Helyezés'}
                                type={'number'}
                                onChange={(e) => {
                                    let copy = structuredClone(results);
                                    copy[index]['place'] = e.target.value;
                                    setResults(copy);
                                }}
                                value={results[index]['place']}
                            />
                        </Grid>
                        <IconButton
                            onClick={() => {
                                let copy = structuredClone(results);
                                copy.splice(index, 1);
                                setResults(copy);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                ))}
                <Grid container justifyContent={'center'}>
                    <IconButton
                        onClick={() => {
                            let copy = structuredClone(results);
                            copy.push({ player: '', place: '', category: '' });
                            setResults(copy);
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Grid>
            </Fragment>
        );
    }

    function list() {
        return (
            <Grid container>
                {results?.length ? (
                    results?.map((result, index) => (
                        <Grid container p={1} key={index}>
                            {<Typography>{`${result.player.name} - ${result.category}, ${result.place}. helyezés`}</Typography>}
                        </Grid>
                    ))
                ) : (
                    <Grid container justifyContent={'center'}>
                        <Typography align="center">Nincsenek bejegyzett eredmények</Typography>
                    </Grid>
                )}
            </Grid>
        );
    }

    return (
        <Dialog open={props.open} maxWidth={'lg'}>
            <DialogTitle align="center">
                {`${props.tournament?.name} eredményei`}{' '}
                {props.user?.is_staff && (
                    <IconButton
                        onClick={() => {
                            setMode('edit');
                        }}
                    >
                        {<EditIcon />}
                    </IconButton>
                )}
            </DialogTitle>

            {mode === 'list' ? list() : update()}
            <Grid container padding={'10px'} py={2} justifyContent={'space-between'}>
                <Button color={'error'} variant={'contained'} onClick={() => props.setOpen(false)}>
                    Bezárás
                </Button>
                <Button color={'success'} disabled={mode === 'list'} variant={'contained'} onClick={() => saveChanges()}>
                    Mentés
                </Button>
            </Grid>
        </Dialog>
    );
}
