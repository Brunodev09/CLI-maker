import mongoose from "mongoose";
import { Router } from 'express';

export interface Controller {
    path: string;
    router: Router;
}
