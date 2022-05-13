import fs from "fs";
import { default as yaml } from "js-yaml";
import { Sequelize } from "sequelize";
import { default as DBG } from "debug";

const debug = DBG("notes:sequelize");
const error = DBG("notes:error-sequelize");

let sequelize;

export async function connectDB() {
    if (!sequelize) {
        let params;

        try {
            const yamlText = fs.readFileSync(process.env.SEQUELIZE_CONNECT, "utf8");
            params = yaml.load(yamlText);
        } catch (err) {
            console.log(err);
        }

        if (process.env.SEQUELIZE_DBNAME) {
            params.dbname = process.env.SEQUELIZE_DBNAME;
        }
        if (process.env.SEQUELIZE_DBUSER) {
            params.username = process.env.SEQUELIZE_DBUSER;
        }
        if (process.env.SEQUELIZE_DBPASSWD) {
            params.password = process.env.SEQUELIZE_DBPASSWD;
        }
        if (process.env.SEQUELIZE_DBHOST) {
            params.params.host = process.env.SEQUELIZE_DBHOST;
        }
        if (process.env.SEQUELIZE_DBPORT) {
            params.params.port = process.env.SEQUELIZE_DBPORT;
        }
        if (process.env.SEQUELIZE_DBDIALECT) {
            params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
        }

        sequelize = new Sequelize(params.dbname, params.username, params.password, params.params);

        try {
            await sequelize.authenticate();
            debug("Sequelize connection has been established successfully.")
        } catch (err) {
            error("Sequelize is unable to connect to the database: ", err);
        }
    
    }
    return sequelize;
}

export async function close() {
    if (sequelize) {
        try {
            await sequelize.close();
            console.log("Sequelize connection has been closed");
        } catch (err) {
            console.error(err);
        }
    }
    sequelize = undefined;
}