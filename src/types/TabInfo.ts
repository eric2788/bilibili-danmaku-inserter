import { RunnerLoadingPattern } from "./runner/RunnerLoadingPattern";

export interface TabInfo<T> {
    id: string,
    render?: string,
    name: string,
    active?: boolean,
    initialize?: () => void,
    runner: RunnerLoadingPattern<T>
}