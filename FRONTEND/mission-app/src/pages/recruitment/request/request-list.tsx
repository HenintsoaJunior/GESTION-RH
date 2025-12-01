"use client";

import ProtectedRoute from "@/components/protected-route";
import React from "react";

const RequestList : React.FC = () => {
    return ( <>
        <h1>Bienvenue dans Recrutement</h1>
    </> );
}

const ProtectedRequestList : React.FC = () => (
    <ProtectedRoute requiredHabilitation="Lister demandes recrutement">
        <RequestList />
    </ProtectedRoute>
);

export default ProtectedRequestList;
