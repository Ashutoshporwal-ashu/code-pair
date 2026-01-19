// Yeh batata hai ki page kaise aayega aur jayega
export const pageAnimation = {
    hidden: {
        opacity: 0,
        y: 50, // Thoda niche se shuru hoga
    },
    show: {
        opacity: 1,
        y: 0, // Apni jagah par aa jayega
        transition: {
            duration: 0.5, // aadha second lagega
            when: "beforeChildren", // Pehle card aayega, phir andar ka maal
            staggerChildren: 0.1, // Andar ki cheezein 0.1s ke gap mein aayengi
        },
    },
    exit: {
        opacity: 0,
        y: -50, // Upar ki taraf gayab hoga
        transition: {
            duration: 0.3,
        },
    },
};

// Yeh batata hai ki andar ke elements (Logo, Input) kaise aayenge
export const elementAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};