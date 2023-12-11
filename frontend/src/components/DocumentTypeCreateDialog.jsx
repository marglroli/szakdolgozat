import { React, useState } from 'react';
import { axios } from '../api';
import { Grid, Dialog, Button, Typography, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DocumentTypeCreateDialog(props) {
    const [category, setCategory] = useState('');

    function handleClose() {
        setCategory('');
        props.setOpen(false);
    }

    async function createCategory() {
        try {
            const response = await axios.post('/api/document-type', { name: category });
            if (response?.status === 201) {
                handleClose();
                props.getDocumentTypes();
                toast.success('Sikeres mentés');
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
                    <Typography variant={'h5'}>Kategória hozzáadása</Typography>
                </Grid>
                <Grid container justifyContent={'center'} paddingY={'10px'}>
                    <Typography variant={'body2'}>
                        Eddigi kategóriák:{' '}
                        {props.documentTypes?.map((type, index) =>
                            index !== props?.documentTypes?.length - 1 ? type?.name + ', ' : type?.name
                        )}
                    </Typography>
                </Grid>
                <Grid container justifyContent={'center'} paddingY={'10px'}>
                    <TextField
                        fullWidth
                        label={'Kategória neve'}
                        type={'text'}
                        onChange={(e) => {
                            setCategory(e.target.value);
                        }}
                        value={category}
                    />
                </Grid>

                <Grid container paddingY={'10px'} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} variant={'contained'} onClick={() => createCategory()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
