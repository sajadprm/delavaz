module.exports = {
    PORT: "3005",
    DatabaseUrl: "mongodb://localhost:27017",
    TOKEN_EXPIRES_IN: '60000000s',
    TOKEN_ALGORITHM: 'HS512', // Note: RS256 does not work!
    TOKEN_SECRET_KEY: 'DelAvaz App Server-Side by Fly To Goal Team',
    kavenegar: {        
		apiKey: '697841634F4E5961424A7956536162426D71753332354F42355864463350476F',
        bazimLineNumber: '30004681',
        templates: {
            lookup: 'delavazVerify',
        },
    },
}