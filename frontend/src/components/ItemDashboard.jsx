import { React, useState, useEffect, useMemo, useRef } from 'react';
import { Grid, Button, Typography, IconButton, Tab, Tabs } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';

import { axios } from '../api';
import ItemTypeCreateDialog from './ItemTypeCreateDialog';
import ItemCreateDialog from './ItemCreateDialog';
import ItemEditDialog from './ItemEditDialog';
import DeleteDialog from './DeleteDialog';

import LendingCreateDialog from './LendingCreateDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ItemDashboard({ user, players }) {
    const [items, setItems] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [itemTypeCreateDialogOpen, setItemTypeCreateDialogOpen] = useState(false);
    const [itemCreateDialogOpen, setItemCreateDialogOpen] = useState(false);
    const [lendingCreateDialogOpen, setLendingCreateDialogOpen] = useState(false);
    const [itemEditDialogOpen, setItemEditDialogOpen] = useState(false);
    const [deleteQuestion, setDeleteQuestion] = useState('');
    const [deleteDescription, setDeleteDescription] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState('items');
    const selectedItemId = useRef(0);
    const [lending, setLending] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('access_token')) {
            navigate('/login');
            return;
        }
        getItems();
    }, []);

    const itemColumns = [
        { field: 'name', headerName: 'Név', width: 250 },
        { field: 'category', headerName: 'Kategória', width: 250 },
        { field: 'lended', headerName: 'Kölcsönözve', width: 250 },
        { field: 'in', headerName: 'Rendelkezésre áll', width: 250 },
        { field: 'count', headerName: 'Összesen', width: 250 },
        {
            field: 'actions',
            headerName: 'Műveletek',
            renderCell: (params) => renderActions(params),
        },
    ];

    const lendingColumns = [
        { field: 'player_name', headerName: 'Játékos neve', width: 300 },
        { field: 'item_name', headerName: 'Eszköz neve', width: 300 },
        { field: 'count', headerName: 'Darabszám', width: 300 },
        { field: 'start_date', headerName: 'Kölcsönzés időpontja', width: 300 },
        {
            field: 'actions',
            headerName: 'Visszakerült',
            renderCell: (params) => renderLendingActions(params),
        },
    ];

    const itemRows = useMemo(() => {
        let data = [];
        items?.map((item) => {
            data.push({
                id: item?.id,
                name: item?.name,
                category: itemTypes?.find((type) => type?.id === item?.type)?.name,
                type: itemTypes?.find((type) => type?.id === item?.type),
                lended: item?.lended,
                in: item?.count - item?.lended,
                count: item?.count,
            });
        });
        return data;
    });

    const lendingRows = useMemo(() => {
        let data = [];

        return data;
    });

    async function deleteItem() {
        try {
            const response = await axios.delete(`/api/item/${selectedItemId.current}`);
            if (response?.status === 204) {
                toast.success('Sikeres törlés');
                getItems();
            }
        } catch (error) {
            toast.error('Sikertelen törlés');
            console.log(error);
        }
    }

    function renderActions(params) {
        const id = params.row.id;
        return (
            <Grid container>
                <Grid item xs={6} md={6}>
                    <IconButton onClick={() => setItemEditDialogOpen(params.row)}>{<EditIcon />}</IconButton>
                </Grid>
                <Grid item xs={6} md={6}>
                    <IconButton
                        onClick={() => {
                            setDeleteDialogOpen(true);
                            setDeleteQuestion('Biztos, hogy törölni szeretné ezt az eszközt?');
                            setDeleteDescription(`${params.row.name} (${params.row.category})`);
                            selectedItemId.current = params.row.id;
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        );
    }

    async function updateLending(id) {
        let offset = new Date().getTimezoneOffset();
        let tmpDate = new Date(new Date().getTime() - offset * 60 * 1000).toISOString().split('T')[0];
        try {
            const response = await axios.patch(`/api/lending/${Number(id)}`, { end_date: tmpDate });
            if (response?.status === 200) {
                let index = lending?.findIndex((lend) => lend?.id === id);
                let copy = [...lending];
                copy.splice(index, 1);
                setLending(copy);
                toast.success('Sikeres mentés');
                getItems();
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    function renderLendingActions(params) {
        const id = params.row.id;
        return (
            <Grid container>
                <Grid item xs={6} md={6}>
                    <IconButton onClick={() => updateLending(id)}>{<CheckIcon sx={{ color: 'green' }} />}</IconButton>
                </Grid>
            </Grid>
        );
    }

    async function getItems() {
        try {
            const [itemResponse, typeResponse, lendingResponse] = await Promise.all([
                await axios.get('/api/item'),
                await axios.get('/api/item-type'),
                await axios.get('/api/lending'),
            ]);
            if (typeResponse?.status === 200) {
                setItemTypes(typeResponse?.data);
            }
            if (itemResponse?.status === 200) {
                setItems(itemResponse?.data);
            }
            if (lendingResponse?.status === 200) {
                setLending(lendingResponse?.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {deleteDialogOpen && (
                <DeleteDialog
                    deleteQuestion={deleteQuestion}
                    description={deleteDescription}
                    open={deleteDialogOpen}
                    setOpen={setDeleteDialogOpen}
                    deleteAction={deleteItem}
                />
            )}
            {itemCreateDialogOpen && (
                <ItemCreateDialog open={itemCreateDialogOpen} setOpen={setItemCreateDialogOpen} itemTypes={itemTypes} getItems={getItems} />
            )}
            {itemEditDialogOpen && (
                <ItemEditDialog open={itemEditDialogOpen} setOpen={setItemEditDialogOpen} itemTypes={itemTypes} getItems={getItems} />
            )}
            {itemTypeCreateDialogOpen && (
                <ItemTypeCreateDialog
                    open={itemTypeCreateDialogOpen}
                    setOpen={setItemTypeCreateDialogOpen}
                    itemTypes={itemTypes}
                    getItems={getItems}
                />
            )}
            {lendingCreateDialogOpen && (
                <LendingCreateDialog
                    open={lendingCreateDialogOpen}
                    setOpen={setLendingCreateDialogOpen}
                    items={items}
                    getItems={getItems}
                    players={players}
                />
            )}
            <Grid container justifyContent={'center'}>
                <Tabs
                    value={tabValue}
                    onChange={(event, newValue) => setTabValue(newValue)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable"
                >
                    <Tab value="items" label="Leltár" />
                    <Tab value="lending" label="Kölcsönzések" />
                </Tabs>
            </Grid>

            {tabValue === 'items' && (
                <Grid container padding={'20px'}>
                    {/* <Grid container justifyContent={'center'}>
                        <Typography variant={'h5'}> Leltár</Typography>
                    </Grid> */}
                    <Grid container justifyContent={'center'}>
                        <Grid item paddingX={'10px'}>
                            <Button onClick={() => setItemCreateDialogOpen(true)}>Új eszköz hozzáadása</Button>
                        </Grid>

                        <Grid item paddingX={'10px'}>
                            <Button onClick={() => setItemTypeCreateDialogOpen(true)}>Új kategória hozzáadása</Button>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <DataGrid fullWidth columns={itemColumns} rows={itemRows}></DataGrid>
                    </Grid>
                </Grid>
            )}

            {tabValue === 'lending' && (
                <Grid container padding={'20px'} justifyContent={'center'}>
                    <Grid item>
                        <Button onClick={() => setLendingCreateDialogOpen(true)}>Kölcsönzés felvétele</Button>
                    </Grid>
                    <Grid container>
                        <DataGrid fullWidth columns={lendingColumns} rows={lending}></DataGrid>
                    </Grid>
                </Grid>
            )}
        </>
    );
}
