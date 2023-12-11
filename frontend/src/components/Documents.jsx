import { Fragment, React, useEffect, useRef, useState } from 'react';
import { Button, Grid, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { axios } from '../api';
import DocumentTypeCreateDialog from './DocumentTypeCreateDialog';
import DocumentCreateDialog from './DocumentUploadDialog';
import DeleteDialog from './DeleteDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Documents({ user, players }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteDescription, setDeleteDescription] = useState('');
    const [deleteQuestion, setDeleteQuestion] = useState('');
    const [documents, setDocuments] = useState([]);
    const [documentTypes, setDocumentTypes] = useState();
    const [documentCreateOpen, setDocumentCreateOpen] = useState(false);
    const [documentTypeCreateOpen, setDocumentTypeCreateOpen] = useState(false);
    const selectedDocumentId = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('access_token')) {
            navigate('/login');
        } else {
            getDocuments();
            getDocumentTypes();
        }
    }, []);

    const dataGridColumns = [
        { field: 'name', headerName: 'Név', width: 300 },
        { field: 'type', headerName: 'Dokumentum típusa', width: 300 },
        {
            field: 'actions',
            headerName: user?.is_staff ? 'Műveletek' : 'Letöltés',
            renderCell: (params) => renderActions(params),
        },
    ];

    async function deleteDocument() {
        try {
            const response = await axios.delete(`/api/document/${selectedDocumentId.current}`);
            if (response.status === 204) {
                toast.success('Sikeres törlés');
                getDocuments();
            }
        } catch (error) {
            toast.error('Sikertelen törlés');
            console.log(error);
        }
    }

    async function downloadDocument(id) {
        try {
            const response = await axios.post('/api/document-download', { id: id });

            const { filename, file } = response.data;

            // Decode the base64 content back to bytes
            const byteCharacters = atob(file);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], {
                type: 'application/octet-stream; charset=UTF-8',
            });

            const url = window.URL || window.webkitURL;
            const fileUrl = url.createObjectURL(blob);

            const anchor = document.createElement('a');

            anchor.href = fileUrl;
            anchor.target = '_blank';
            anchor.download = filename;
            anchor.style.display = 'none';

            document.body.appendChild(anchor);
            anchor.click();

            // Clean up
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(fileUrl);
        } catch (err) {
            // setLoading(false);
            toast.error('Hiba történt a fájl letöltése során');
        }
    }

    async function getDocuments() {
        try {
            const response = await axios.get('/api/document');
            setDocuments(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    async function getDocumentTypes() {
        try {
            const response = await axios.get('/api/document-type');
            setDocumentTypes(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    function renderActions(params) {
        const id = params.row.id;

        return (
            <Grid container>
                <Grid item xs={6} md={6}>
                    <IconButton onClick={() => downloadDocument(params.row.id)}>{<DownloadIcon />}</IconButton>
                </Grid>
                {user?.is_staff && (
                    <Grid item xs={6} md={6}>
                        <IconButton
                            onClick={() => {
                                setDeleteDialogOpen(true);
                                setDeleteQuestion('Biztos, hogy törölni szeretné ezt a dokumentumot?');
                                setDeleteDescription(`${params.row.name} (${params.row.type})`);
                                selectedDocumentId.current = params.row.id;
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                )}
            </Grid>
        );
    }

    return (
        <Grid container justifyContent={'center'}>
            <DocumentTypeCreateDialog
                open={documentTypeCreateOpen}
                setOpen={setDocumentTypeCreateOpen}
                documentTypes={documentTypes}
                getDocumentTypes={getDocumentTypes}
            />
            <DocumentCreateDialog
                open={documentCreateOpen}
                setOpen={setDocumentCreateOpen}
                documentTypes={documentTypes}
                getDocuments={getDocuments}
            />
            <DeleteDialog
                deleteQuestion={deleteQuestion}
                description={deleteDescription}
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                deleteAction={deleteDocument}
            />
            {user?.is_staff && (
                <Fragment>
                    <Button onClick={() => setDocumentTypeCreateOpen(true)}>Kategória hozzáadása</Button>
                    <Button onClick={() => setDocumentCreateOpen(true)}>Fájl feltöltése</Button>
                </Fragment>
            )}
            <Grid container justifyContent={'center'} py={'10px'}>
                <Grid item sx={{ width: '750px' }}>
                    <DataGrid columns={dataGridColumns} rows={documents} />
                </Grid>
            </Grid>
        </Grid>
    );
}
