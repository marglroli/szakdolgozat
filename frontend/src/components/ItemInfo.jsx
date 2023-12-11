import { React } from 'react';
import { TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function ItemInfo(props) {
    return (
        <>
            <Grid container padding={'10px'}>
                <TextField
                    fullWidth
                    label={'Név'}
                    type={'Text'}
                    onChange={(e) => {
                        let copy = { ...props.item };
                        copy['name'] = e.target.value;
                        props.setItem(copy);
                    }}
                    value={props.item['name']}
                />
            </Grid>
            <Grid container padding={'10px'}>
                <FormControl fullWidth>
                    <InputLabel>Kategória</InputLabel>

                    <Select
                        value={props.item['type'] || ''}
                        label="Kategória"
                        onChange={(e) => {
                            let copy = { ...props.item };
                            copy['type'] = e.target.value;
                            props.setItem(copy);
                        }}
                    >
                        {props?.itemTypes?.map((type) => (
                            <MenuItem key={type.id} value={type}>
                                {type?.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid container padding={'10px'}>
                <TextField
                    fullWidth
                    label={'Darabszám'}
                    type={'number'}
                    onChange={(e) => {
                        let copy = { ...props.item };
                        copy['count'] = e.target.value;
                        props.setItem(copy);
                    }}
                    value={props.item['count']}
                />
            </Grid>
        </>
    );
}
