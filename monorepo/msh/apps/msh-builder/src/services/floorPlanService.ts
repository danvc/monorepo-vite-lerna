import axios, { AxiosResponse } from 'axios';
import { IFloorPlan } from 'ui-floorplan-react';

export const fetchFloorplan = (): Promise<AxiosResponse<IFloorPlan>> =>
  axios.get<IFloorPlan>('https://jsonplaceholder.typicode.com/todos');
