export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export type RobotClass = 'TANK' | 'SCOUT' | 'SNIPER';

export interface RobotState {
    id: string;
    name: string;
    class: RobotClass;
    teamId: string;
    position: Vector3;
    heading: number;
    gunHeading: number;
    radarHeading: number;
    velocity: number;
    energy: number;
    hull: number;
    heat: number;
    shieldHp: number;
    isStealthed: boolean;
    cooldowns: Record<string, number>;
}

export interface BulletState {
    id: string;
    ownerId: string;
    position: Vector3;
    heading: number;
    velocity: number;
    power: number;
}

export interface ArenaConfig {
    width: number;
    height: number;
}

export interface ZoneState {
    x: number;
    y: number;
    radius: number;
}

export interface WorldState {
    tick: number;
    status: number; // MatchStatus enum
    bots: RobotState[];
    bullets: BulletState[];
    zone?: ZoneState;
}
