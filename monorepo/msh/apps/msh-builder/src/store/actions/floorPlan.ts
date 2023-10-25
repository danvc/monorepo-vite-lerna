import { IFloorPlan } from 'ui-floorplan-react';
export enum floorPlanActionType {
  FETCH_FLOORPLAN_REQUEST = 'FETCH_FLOORPLAN_REQUEST',
  FETCH_FLOORPLAN_SUCCESS = 'FETCH_FLOORPLAN_SUCCESS',
  FETCH_FLOORPLAN_FAILURE = 'FETCH_FLOORPLAN_FAILURE',
}

export interface FetchFloorPlanSuccessPayload {
  floorplan: IFloorPlan;
}

export interface FetchFloorPlanFailurePayload {
  error: string;
}

export interface FetchFloorPlanRequest {
  type: typeof floorPlanActionType.FETCH_FLOORPLAN_REQUEST;
}

export type FetchFloorPlanSuccess = {
  type: typeof floorPlanActionType.FETCH_FLOORPLAN_SUCCESS;
  payload: FetchFloorPlanSuccessPayload;
};

export type FetchFloorPlanFailure = {
  type: typeof floorPlanActionType.FETCH_FLOORPLAN_FAILURE;
  payload: FetchFloorPlanFailurePayload;
};

export type FloorPlanActions = FetchFloorPlanRequest | FetchFloorPlanSuccess | FetchFloorPlanFailure;

export const fetchFloorPlanRequest = (): FetchFloorPlanRequest => ({
  type: floorPlanActionType.FETCH_FLOORPLAN_REQUEST,
});

export const fetchFloorPlanSuccess = (payload: FetchFloorPlanSuccessPayload): FetchFloorPlanSuccess => ({
  type: floorPlanActionType.FETCH_FLOORPLAN_SUCCESS,
  payload,
});

export const fetchFloorPlanFailure = (payload: FetchFloorPlanFailurePayload): FetchFloorPlanFailure => ({
  type: floorPlanActionType.FETCH_FLOORPLAN_FAILURE,
  payload,
});
