import { React, useEffect, useMemo, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button } from '@mui/material';
import { axios } from '../api';
import ItemInfo from './ItemInfo';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultObject = {
    name: '',
    type: {},
    count: 1,
};

export default function ItemEditDialog(props) {
    const [item, setItem] = useState(defaultObject);

    useEffect(() => {
        setItem(props?.open);
    }, [JSON.stringify(props.open)]);

    const buttonDisabled = useMemo(() => {
        return !Boolean(item?.name?.length) || !Boolean(Object.keys(item?.type ?? {})?.length);
    }, [JSON.stringify(item)]);

    function handleClose() {
        setItem(defaultObject);
        props.setOpen(false);
    }

    async function editItem() {
        const data = {
            id: item?.id,
            name: item?.name,
            count: item?.count,
            type: item?.type?.id,
        };
        try {
            const response = await axios.patch(`/api/item/${Number(item?.id)}`, data);
            if (response?.status === 200) {
                toast.success('Sikeres mentés');
                props?.getItems();
                handleClose();
            }
        } catch (error) {
            toast.error('Sikertelen mentés');
            console.log(error);
        }
    }

    return (
        <Dialog open={Boolean(props.open)} fullWidth>
            <Grid container padding={'20px'} justifyContent={'center'}>
                <Typography variant={'h5'}>Eszköz adatok módosítása</Typography>
                <ItemInfo item={item} setItem={setItem} itemTypes={props.itemTypes} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Mégse
                    </Button>
                    <Button color={'success'} disabled={buttonDisabled} variant={'contained'} onClick={() => editItem()}>
                        Mentés
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
