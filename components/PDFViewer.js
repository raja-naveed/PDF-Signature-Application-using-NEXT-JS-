import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import {
  Typography,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Box,
  Input
} from '@mui/material';
import { FileCopy, Edit } from '@mui/icons-material';

export default function PDFViewer() {
  const [signing, setSigning] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [signatureMode, setSignatureMode] = useState(false);
  const sigPad = useRef(null);

  const clear = () => {
    sigPad.current.clear();
  };

  const trim = async () => {
    if (!pdf) return;

    setSigning(true);

    const trimmedDataURL = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

    try {
      const pdfDoc = await PDFDocument.load(pdf);

      const pngImage = await pdfDoc.embedPng(trimmedDataURL);
      const pngDims = pngImage.scale(0.17);

      const pages = pdfDoc.getPages();

      // Identify the desired page by index (subtract 1 since the index is zero-based)
      const pageToAddSignature = pages[pageNumberToAddSignature - 1];

      pageToAddSignature.drawImage(pngImage, {
        x: 120, // Adjust the position where the signature will be placed
        y: 59, // Adjust the position where the signature will be placed
        width: pngDims.width,
        height: pngDims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      setPdf(modifiedPdfBytes);
    } catch (error) {
      console.error('Error:', error);
    }

    setSigning(false);
  };

  const handleChange = e => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = () => {
      setPdf(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSignatureOptionClick = () => {
    setSignatureMode(true);
  };

  return (
    <Container>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h4" component="div" align="center">
            <FileCopy sx={{ mr: 1 }} />
            PDF Signature
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Input type="file" onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper>
            <Box p={2}>
              <iframe title="pdframe" src={pdf} width="100%" height="1000px" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper>
            <Box p={2}>
              {signatureMode && (
                <SignatureCanvas
                  penColor="black"
                  ref={sigPad}
                  canvasProps={{ className: 'signatureCanvas' }}
                />
              )}
              <Box mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={clear}
                  disabled={signing}
                >
                  Clear
                </Button>

                {!signatureMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSignatureOptionClick}
                    sx={{ ml: 1 }}
                  >
                    Signature
                  </Button>
                )}

                {signatureMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={signing ? <CircularProgress size={14} /> : <Edit />}
                    onClick={trim}
                    disabled={signing}
                    sx={{ ml: 1 }}
                  >
                    {signing ? 'Signing...' : 'Sign'}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
