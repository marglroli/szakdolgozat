import { Fragment, React, useEffect, useState, useRef } from 'react';
import { Tab, Tabs, Grid, Button, Typography, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DeleteDialog from './DeleteDialog';
import PlayerCreateDialog from './PlayerCreateDialog';
import { axios } from '../api';
import PaymentCreateDialog from './PaymentCreateDialog';
import PaymentEditDialog from './PaymentEditDialog';
import PlayerEditDialog from './PlayerEditDialog';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PlayerDashboard({ user, players, getPlayers }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDescription, setDeleteDescription] = useState('');
    const [deleteQuestion, setDeleteQuestion] = useState('');
    const [lendingCreateDialogOpen, setLendingCreateDialogOpen] = useState(false);
    const [paymentCreateOpen, setPaymentCreateOpen] = useState(false);
    const [paymentEditOpen, setPaymentEditOpen] = useState(false);
    const [payments, setPayments] = useState();
    const [playercreateDialogOpen, setPlayerCreateDialogOpen] = useState(false);
    const [playerEditDialogOpen, setPlayerEditDialogOpen] = useState(false);
    const [rankData, setRankData] = useState({});
    const [tabValue, setTabValue] = useState('players');
    const [xls, setXls] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('access_token')) {
            navigate('/login');
        } else {
            getPayments();
        }
    }, []);

    useEffect(() => {
        if (tabValue === 'powerRanking') {
            getPowerRankingData();
        }
    }, [tabValue]);

    const playerId = useRef(null);
    const paymentId = useRef(null);
    const deleteAction = useRef(null);

    async function getPayments() {
        try {
            const response = await axios.get('/api/payment');
            if (response?.status === 200) {
                for (let i = 0; i < response.data.length; i++) {
                    response.data[i] = {
                        ...response.data[i],
                        name: players?.find((player) => player?.id === response.data[i]?.player)?.name,
                    };
                }

                setPayments(response?.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const paymentColumns = [
        { field: 'name', headerName: 'Játékos', width: 250 },
        { field: 'date', headerName: 'Befizetés ideje', width: 250 },
        { field: 'start', headerName: 'Intervallum kezdete', width: 250 },
        { field: 'end', headerName: 'Intervallum vége', width: 250 },
        { field: 'amount', headerName: 'Összeg', width: 250 },
        {
            field: 'actions',
            headerName: 'Műveletek',
            renderCell: (params) => renderActions(params),
        },
    ];

    function renderActions(params) {
        const id = params.row.id;
        return (
            <Grid container>
                <Grid item xs={6} md={6}>
                    <IconButton
                        onClick={() => {
                            let copy = { ...params.row };
                            copy['player'] = players?.find((player) => player?.id == params.row.player);

                            setPaymentEditOpen(copy);
                        }}
                    >
                        {<EditIcon />}
                    </IconButton>
                </Grid>
                <Grid item xs={6} md={6}>
                    <IconButton
                        onClick={() => {
                            setDeleteDialogOpen(true);
                            setDeleteQuestion('Biztos, hogy törölni szeretné ezt a befizetést?');
                            setDeleteDescription(`${params.row.name} (${params.row.start} - ${params.row.end})`);
                            deleteAction.current = deletePayment;
                            paymentId.current = params.row.id;
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        );
    }

    async function deletePlayer() {
        try {
            const response = await axios.delete('/api/player/' + playerId.current);
            if (response?.status === 204) {
                toast.success('Sikeres törlés');
                getPlayers();
            }
        } catch (error) {
            console.log(error);
            toast.error('Sikertelen törlés');
        }
    }

    async function deletePayment() {
        try {
            const response = await axios.delete('/api/payment/' + paymentId.current);
            if (response?.status === 204) {
                toast.success('Sikeres törlés');
                getPayments();
            }
        } catch (error) {
            toast.error('Sikertelen törlés');
            console.log(error);
        }
    }

    async function getEloLog(fide = undefined, last_list = undefined) {
        setLoading(true);
        try {
            const response = await axios.post('/api/elo-log', { fide, last_list });
            if (response.status === 200) {
                toast.success('Sikeres szinkronizáció');
            }
        } catch (error) {
            toast.error('Hiba történt a szinkronizáció során');
        }
        setLoading(false);
    }

    async function getPowerRankingData() {
        try {
            const response = await axios.get('/api/get-power-ranking');
            setRankData(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function savePowerRanking() {
        try {
            const response = await axios.post('/api/power-ranking-save', rankData.ranklist);
            if (response.status === 200) {
                toast.success('Sikeres mentés');
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
        }
    }

    async function uploadPowerRanking(file) {
        try {
            // setLoading(true);
            let data = new FormData();
            data.append('file', file);
            axios
                .post('/api/power-ranking-upload', data)
                .then((response) => {
                    if (response.status === 200) {
                        setRankData(response.data);
                        if (response.data?.problem?.length) {
                            const content = (
                                <Fragment>
                                    <p>A következő sorokat nem sikerült beolvasni:</p>
                                    {response.data.problem.map((problem, index) => (
                                        <div key={index}>
                                            {problem[0]} - {problem[1]}
                                        </div>
                                    ))}
                                </Fragment>
                            );

                            toast.info(content, { autoClose: 10000, enableHtml: true });
                        }
                    }
                })
                .catch((error) => {
                    if (error.response.status === 400) {
                        toast.error('A feltöltött erősorrend nem tartalmaz Név vagy FIDE oszlopot');
                    } else {
                        toast.error('Hiba történt a fájl betöltésekor!');
                    }
                    console.log(error);
                });
            // .finally(() => setLoading(false));
        } catch (err) {
            // setLoading(false);
            // setWarning(t('Hiba történt a fájl betöltésekor!'));
        }
        setXls(file);
    }

    return (
        <Grid container>
            <DeleteDialog
                deleteQuestion={deleteQuestion}
                description={deleteDescription}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                deleteAction={deleteAction.current}
            />
            <Grid container justifyContent={'center'}>
                <Tabs
                    value={tabValue}
                    onChange={(event, newValue) => setTabValue(newValue)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable"
                >
                    <Tab value="players" label="Játékosok adatai" />
                    <Tab value="payment" label="Tagdíj befizetések" />
                    <Tab value="powerRanking" label="Erősorrend" />
                </Tabs>
            </Grid>

            {tabValue === 'players' && (
                <Grid container justifyContent={'center'}>
                    {playercreateDialogOpen && (
                        <PlayerCreateDialog open={playercreateDialogOpen} setOpen={setPlayerCreateDialogOpen} getPlayers={getPlayers} />
                    )}
                    {playerEditDialogOpen && (
                        <PlayerEditDialog
                            open={playerEditDialogOpen}
                            setOpen={setPlayerEditDialogOpen}
                            playerId={playerId}
                            getPlayers={getPlayers}
                        />
                    )}
                    <Grid container item xs={12} justifyContent={'center'}>
                        <LoadingButton loading={loading} onClick={() => getEloLog(undefined, true)}>
                            Utolsó hónap FIDE adatainak szinkronizálása
                        </LoadingButton>
                    </Grid>
                    <Grid container item xs={12} justifyContent={'center'}>
                        <LoadingButton loading={loading} onClick={() => getEloLog()}>
                            Összes játékos FIDE adatainak szinkronizálása
                        </LoadingButton>
                    </Grid>
                    <Grid container item xs={12} md={6} xl={4} justifyContent={'center'} py={2}>
                        <Button onClick={() => setPlayerCreateDialogOpen(true)}>Játékos felvétele</Button>
                        {players?.map((player, index) => {
                            return (
                                <Grid container key={index}>
                                    <Grid item xs={8}>
                                        <Typography>{player?.name}</Typography>
                                    </Grid>
                                    <Grid container item xs={4} justifyContent={'center'}>
                                        <IconButton
                                            onClick={() => {
                                                setPlayerEditDialogOpen(true);
                                                playerId.current = player?.id;
                                            }}
                                        >
                                            {<EditIcon />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setDeleteDialogOpen(true);
                                                setDeleteQuestion('Biztos, hogy törölni szeretné ezt a játékost?');
                                                setDeleteDescription(player.name);
                                                deleteAction.current = deletePlayer;
                                                playerId.current = player?.id;
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        {player.fide_id && (
                                            <IconButton onClick={() => getEloLog(player.fide_id)}>
                                                <InsertChartIcon />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>
            )}

            {tabValue === 'payment' && (
                <Fragment>
                    <PaymentCreateDialog
                        open={paymentCreateOpen}
                        setOpen={setPaymentCreateOpen}
                        players={players}
                        getPayments={getPayments}
                    />
                    <PaymentEditDialog open={paymentEditOpen} setOpen={setPaymentEditOpen} players={players} getPayments={getPayments} />

                    <Grid container padding={'20px'} justifyContent={'center'}>
                        <Grid item>
                            <Button onClick={() => setPaymentCreateOpen(true)}>Befizetés felvétele</Button>{' '}
                        </Grid>
                        <Grid container>
                            <DataGrid fullWidth columns={paymentColumns} rows={payments}></DataGrid>
                        </Grid>
                    </Grid>
                </Fragment>
            )}

            {tabValue === 'powerRanking' && (
                <Grid container justifyContent={'center'}>
                    <Grid container py={2}>
                        <Grid container justifyContent={'center'}>
                            <Button component={'label'} sx={{ width: 'auto' }} variant={'outlined'}>
                                {xls ? xls?.name : 'Erősorrend feltöltése'}
                                <input
                                    name={'file'}
                                    hidden
                                    onChange={(event) => uploadPowerRanking(event.target.files?.[0])}
                                    type={'file'}
                                />
                            </Button>
                        </Grid>
                        <Grid container justifyContent={'center'}>
                            <Typography variant={'body2'} align="center">
                                A feltöltött xls fájlnak tartalmaznia kell 'Név' és 'FIDE' oszlopokat!
                            </Typography>
                        </Grid>
                    </Grid>
                    {rankData?.ranklist?.length ? (
                        <Grid container item xs={12} md={6} xl={4}>
                            {rankData?.ranklist?.map((record, index) => (
                                <Grid container justifyContent="space-between" key={index}>
                                    <Grid item>
                                        <Typography>{record?.player?.name}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography>
                                            {index !== 0 && (
                                                <IconButton
                                                    onClick={() => {
                                                        let copy = structuredClone(rankData);
                                                        let tmp = copy.ranklist[index]['player'];
                                                        copy.ranklist[index]['player'] = copy.ranklist[index - 1]['player'];
                                                        copy.ranklist[index - 1]['player'] = tmp;
                                                        setRankData(copy);
                                                    }}
                                                >
                                                    <KeyboardArrowUpIcon />
                                                </IconButton>
                                            )}

                                            {index !== rankData?.ranklist?.length - 1 && (
                                                <IconButton
                                                    onClick={() => {
                                                        let copy = structuredClone(rankData);
                                                        let tmp = copy.ranklist[index]['player'];
                                                        copy.ranklist[index]['player'] = copy.ranklist[index + 1]['player'];
                                                        copy.ranklist[index + 1]['player'] = tmp;
                                                        setRankData(copy);
                                                    }}
                                                >
                                                    <KeyboardArrowDownIcon />
                                                </IconButton>
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ))}

                            {rankData?.remaining_players?.length ? (
                                <Typography py={2}>Erősorrenden nem szereplő játékosok:</Typography>
                            ) : null}

                            {rankData?.remaining_players?.map((player, index) => (
                                <Grid container justifyContent="space-between" key={index}>
                                    <Grid item>
                                        <Typography>{player?.name}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography>
                                            <IconButton
                                                onClick={() => {
                                                    let copy = structuredClone(rankData);
                                                    copy.ranklist.push({ rank: rankData.ranklist.length + 1, player });
                                                    copy.remaining_players.splice(index, 1);
                                                    setRankData(copy);
                                                }}
                                            >
                                                <KeyboardArrowUpIcon />
                                            </IconButton>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ))}
                            <Grid container py={1} justifyContent={'space-between'}>
                                <Button
                                    style={{ marginRight: '5px' }}
                                    onClick={() => {
                                        getPowerRankingData();
                                    }}
                                    variant="contained"
                                >
                                    Visszaállítás
                                </Button>
                                <Button color="success" onClick={() => savePowerRanking()} variant="contained">
                                    Mentés
                                </Button>
                            </Grid>
                        </Grid>
                    ) : null}
                </Grid>
            )}
        </Grid>
    );
}
