import { React, useMemo, useState } from 'react';
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

export default function ItemCreateDialog(props) {
    const [item, setItem] = useState(defaultObject);

    function handleClose() {
        setItem(defaultObject);
        props.setOpen(false);
    }

    const buttonDisabled = useMemo(() => {
        return !Boolean(item?.name?.length) || !Boolean(Object.keys(item?.type ?? {})?.length);
    }, [JSON.stringify(item)]);

    async function createItem() {
        const data = { ...item, type: item.type.id };
        try {
            const response = await axios.post('/api/item/', data);
            if (response?.status === 201) {
                props.setOpen(false);
                toast.success('Sikeres mentés');
                setItem(defaultObject);
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
                <Typography variant={'h5'}>Eszköz hozzáadása</Typography>
                <ItemInfo item={item} setItem={setItem} itemTypes={props.itemTypes} />
                <Grid container padding={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} disabled={buttonDisabled} variant={'contained'} onClick={() => createItem()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
