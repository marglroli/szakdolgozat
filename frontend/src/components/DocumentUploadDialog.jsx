import { React, useState } from 'react';
import { Dialog } from '@mui/material';
import { Grid, Typography, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { axios } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DocumentCreateDialog(props) {
    const [file, setFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState({});

    function handleClose() {
        setFile(null);
        props.setOpen(false);
    }

    async function uploadFile() {
        let data = new FormData();
        data.append('file', file);
        data.append('type', selectedCategory.id);
        data.append('uploader', 1);
        try {
            const response = await axios.post('/api/document-upload', data);
            if (response.status === 200) {
                toast.success('Sikeres feltöltés');
                props.getDocuments();
                handleClose();
            }
        } catch (error) {
            toast.error('Sikertelen feltöltés');
            console.log(error);
        }
    }

    return (
        <Dialog open={props.open} fullWidth>
            <Grid container>
                <Grid container p={1}>
                    <Button component={'label'} sx={{ width: '100%' }} variant={'outlined'}>
                        {file ? file?.name : 'Tallózás'}
                        <input name={'file'} hidden onChange={(event) => setFile(event.target.files?.[0])} type={'file'} />
                    </Button>{' '}
                </Grid>
                <Grid container p={1}>
                    <FormControl fullWidth>
                        <InputLabel>Kategória</InputLabel>
                        <Select
                            value={selectedCategory || ''}
                            label="Kategória"
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                            }}
                        >
                            {props?.documentTypes?.map((type) => (
                                <MenuItem key={type.id} value={type}>
                                    {type?.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid container p={1} justifyContent={'space-between'}>
                    <Button color={'error'} variant={'contained'} onClick={() => handleClose()}>
                        Bezárás
                    </Button>
                    <Button color={'success'} disabled={!file || !selectedCategory?.id} variant={'contained'} onClick={() => uploadFile()}>
                        Hozzáadás
                    </Button>
                </Grid>
            </Grid>
        </Dialog>
    );
}
