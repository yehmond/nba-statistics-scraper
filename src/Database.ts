import {Db, MongoClient} from "mongodb";
import {ISeasonStat} from "./Interfaces";


export default class Database {
    client: MongoClient | undefined;
    dbName: string;
    db: Db | undefined;
    url: string;
    PLAYERS_COLLECTION = "players";
    TEAMS_COLLECTION = "teams";

    constructor(url: string, dbName: string) {
        this.url = url;
        this.dbName = dbName;
    }

    async connect(): Promise<void> {
        try {
            this.client = await MongoClient.connect(this.url, {useUnifiedTopology: true});
            console.log('🚀 MongoDB connected...');
            if (this.client) {
                this.db = this.client.db(this.dbName);
            }
        } catch (err) {
            console.trace(err);
        }

    }

    async disconnect(): Promise<void> {
        await this.client?.close();
        console.log('✋ MongoDB disconnected...');
    }

    async queryTeamIDs(): Promise<any[] | void> {
        this.checkNotNull(this.db);
        return this.db?.collection(this.TEAMS_COLLECTION)
            .find({}, {projection: {_id: 0, __v: 0,}})
            .toArray();
    }

    async addPlayer(id: string, name: string, playerSeasonStat: ISeasonStat | null): Promise<void> {
        if (!(await this.db?.collection(this.PLAYERS_COLLECTION).findOne({id: id}))) {
            const player = {
                name,
                id,
                stat: playerSeasonStat ? [playerSeasonStat] : []
            };
            this.checkNotNull(this.db);
            await this.db?.collection(this.PLAYERS_COLLECTION).insertOne(player);
        }

    }

    checkNotNull(obj: any): void {
        if (!obj) {
            throw new Error(`The object ${obj} is null!`);
        }
    }

    async addPlayerSeasonStat(id: string, name: string, playerSeasonStat: ISeasonStat): Promise<void> {
        const findQuery = {
            id: id,
            stat: {
                $elemMatch: {
                    YEAR: playerSeasonStat.YEAR,
                    SEASON_TYPE: playerSeasonStat.SEASON_TYPE,
                }
            }
        };
        if (!(await this.db?.collection(this.PLAYERS_COLLECTION).findOne(findQuery))) {
            const query = {id: id};
            const newValue = {$push: {stat: playerSeasonStat}};
            await this.db?.collection(this.PLAYERS_COLLECTION).updateOne(query, newValue);
        }
    }
}

