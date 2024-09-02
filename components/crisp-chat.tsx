"use client"

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("57a454ef-dee8-49c1-b1c0-2d42ad3a0bbc");
    }, []);

    return null;
}