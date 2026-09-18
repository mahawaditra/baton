const year = new Date().getFullYear();

console.log(`
Reset and seed finished. The database is clean, but Google Drive is not touched.
Leftovers you can delete by hand in the BATON folder:

  Safe to delete
    Logistik ${year}/Peminjaman Alat/Generated Contract/   blank contracts of the wiped requests
    Logistik ${year}/Peminjaman Alat/Borrower Archive/     borrower documents and addendum photos
    Logistik ${year}/Inventory Snapshots/                  exported snapshots
    Logistik ${year}/Annual Reports/                       not written by the app, usually empty
    Assets/Item Photos/                                 photos of instruments and goods that no longer exist
    (the whole Logistik ${year} folder is fine too, the app recreates it on demand)

  DO NOT delete
    Assets/Fonts/                 contract PDF fonts, generation breaks without them
    Assets/Signature_*.png        the signature image, loan settings still points to it
`);
