import { Fragment, React, useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
ChartJS.register(CategoryScale, Colors, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { axios } from '../api';
import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
    Typography,
    Table,
    TableRow,
    TableCell,
    TableHead,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function eloStats(props) {
    const [eloStats, setEloStats] = useState({});
    const [results, setResults] = useState('');
    const today = new Date();
    const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const [endDate, setEndDate] = useState(new Date());
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [ratingTypes, setRatingTypes] = useState([]);
    const [radioValue, setRadioValue] = useState('');
    const [tabValue, setTabValue] = useState('elo');

    useEffect(() => {
        getRatingTypes();
    }, []);

    async function getRatingTypes() {
        try {
            const response = await axios.get('/api/rating-types');
            if (response?.status === 200) {
                setRatingTypes(response.data);
                setRadioValue(response.data[0]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function getEloStats() {
        setEloStats({});
        let data = { players: selectedPlayers, type: radioValue.id };

        let start = new Date(startDate);
        const offset = start.getTimezoneOffset();
        start = new Date(start.getTime() - offset * 60 * 1000);
        data['start'] = start.toISOString().split('T')[0];

        let end = new Date(endDate);
        end = new Date(end.getTime() - offset * 60 * 1000);
        data['end'] = end.toISOString().split('T')[0];

        try {
            const response = await axios.post('/api/elo-stats', data);
            if (response?.status === 200) {
                setEloStats(response?.data);
            }
        } catch (error) {
            toast.error('Hiba történt a lekérdezés közben');
            console.log(error);
        }
    }

    async function getResults() {
        setResults('');
        let data = {};

        let start = new Date(startDate);
        const offset = start.getTimezoneOffset();
        start = new Date(start.getTime() - offset * 60 * 1000);
        data['start'] = start.toISOString().split('T')[0];

        let end = new Date(endDate);
        end = new Date(end.getTime() - offset * 60 * 1000);
        data['end'] = end.toISOString().split('T')[0];

        try {
            const response = await axios.post('/api/results', data);
            if (response?.status === 200) {
                setResults(response?.data);
            }
        } catch (error) {
            toast.error('Hiba történt a lekérdezés közben');
            console.log(error);
        }
    }

    return (
        <Grid container>
            <Grid container justifyContent={'center'}>
                <Tabs
                    value={tabValue}
                    onChange={(event, newValue) => setTabValue(newValue)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable"
                >
                    <Tab value="elo" label="Élő-pontok" />
                    <Tab value="results" label="Versenyeredmények" />
                </Tabs>
            </Grid>
            {tabValue === 'results' && (
                <Grid container justifyContent={'center'} py={2}>
                    <Typography align="center" variant="h5" sx={{ color: 'rgb(255,193,7)' }}>
                        Dicsőségtábla
                    </Typography>
                </Grid>
            )}

            <Fragment>
                <Grid container justifyContent={'center'} py={2} alignItems={'center'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Időtartam kezdete"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            sx={{ paddingX: '10px' }}
                        />
                        <DatePicker label="Időtartam vége" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
                    </LocalizationProvider>
                    <FormControl sx={{ paddingLeft: '20px' }}>
                        {/* <FormLabel sx={{ textAlign: 'center' }}>Kategória</FormLabel> */}
                        {tabValue === 'elo' && (
                            <RadioGroup
                                row
                                onChange={(e) => {
                                    setRadioValue(JSON.parse(e.target.value));
                                }}
                                value={JSON.stringify(radioValue)}
                            >
                                {ratingTypes?.map((type) => (
                                    <FormControlLabel value={JSON.stringify(type)} control={<Radio />} label={type.name} />
                                ))}
                            </RadioGroup>
                        )}
                    </FormControl>
                </Grid>
                <Grid container justifyContent={'center'}></Grid>
                <Grid container sx={{ maxHeight: '8rem', overflowY: 'auto' }}>
                    {tabValue === 'elo'
                        ? props.players?.map((player) => {
                              if (player?.fide_id)
                                  return (
                                      <Grid container item md={3} xs={6} alignItems={'center'} key={player.id}>
                                          <Grid item xs={2}>
                                              <Checkbox
                                                  checked={selectedPlayers.includes(player.id)}
                                                  onChange={(e) => {
                                                      let copy = [...selectedPlayers];
                                                      if (e.target.checked) {
                                                          copy.push(player.id);
                                                      } else {
                                                          copy.splice(copy.indexOf(player.id), 1);
                                                      }
                                                      setSelectedPlayers(copy);
                                                  }}
                                              />
                                          </Grid>
                                          <Grid item xs={10}>
                                              <Typography>{player.name}</Typography>
                                          </Grid>
                                      </Grid>
                                  );
                          })
                        : null}
                </Grid>

                <Grid container justifyContent={'center'}>
                    <Button variant="contained" onClick={() => (tabValue === 'elo' ? getEloStats() : getResults())}>
                        Lekérdezés
                    </Button>
                </Grid>

                {Object.keys(eloStats)?.length && tabValue === 'elo' ? (
                    <Grid container justifyContent={'center'}>
                        <Grid item xs={12} md={6}>
                            <Line data={eloStats} />
                        </Grid>
                    </Grid>
                ) : null}

                {tabValue === 'results' && Array.isArray(results) && results?.length === 0 ? (
                    <Grid container justifyContent={'center'} py={2}>
                        <Typography align="center">Nem található dobogós helyezés az adott időszakban</Typography>
                    </Grid>
                ) : null}

                {tabValue === 'results' && Array.isArray(results) && results?.length > 0 ? (
                    <Table component={Paper}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Játékos</TableCell>
                                <TableCell align="center">1. helyek</TableCell>
                                <TableCell align="center">2. helyek</TableCell>
                                <TableCell align="center">3. helyek</TableCell>
                            </TableRow>
                        </TableHead>
                        {results?.map((result) => (
                            <TableRow>
                                <TableCell align="center">{result.player}</TableCell>
                                <TableCell align="center">{result['1st']}</TableCell>
                                <TableCell align="center">{result['2nd']}</TableCell>
                                <TableCell align="center">{result['3rd']}</TableCell>
                            </TableRow>
                        ))}
                    </Table>
                ) : null}
            </Fragment>
        </Grid>
    );
}
