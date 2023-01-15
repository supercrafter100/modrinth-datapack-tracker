import { ModrinthProject } from "@/types/ModrinthAPI";
import fetch from "node-fetch";
import { scheduleJob } from "node-schedule";
import pool from "./db";

class StatisticsTracker {

    private readonly url = "https://api.modrinth.com/v2/search?limit=20&index=relevance&facets=[[%22categories:%27datapack%27%22],[%22project_type:mod%22]]";

    /**
     * Track the stats of all 20 top datapack projects of modrinth 
     */
    private async track() {
        const date = new Date();
        const response = await fetch(this.url);
        const json = await response.json() as { hits: ModrinthProject[] };

        // Check if there are any new projects
        for (const project of json.hits) {
            if (!await this.projectExists(project.project_id)) {
                await this.addProject(project.project_id, project.title);
            }
        }

        // Get all projects and collect their data
        const projects = await this.getProjects();
        for (const project of projects) {
            const response = await fetch(`https://api.modrinth.com/v2/project/${project.project_id}`);
            const json = await response.json() as ModrinthProject;
            await this.insertStats(project.project_id, json.downloads, json.followers, date);
        }
    }

    /**
     * Check whether the project exists in the database
     * @param projectId The project id
     * @returns {Promise<boolean>} Whether the project exists
     */
    public async projectExists(projectId: string) {
        const response = await pool.query("SELECT * FROM `projects` WHERE `project_id` = ?", [projectId]) as Array<any>;
        return response[0].length > 0;
    }

    /**
     * Add a project to the database
     * @param projectId The project id
     */
    public async addProject(projectId: string, projectName: string) {
        await pool.query("INSERT INTO `projects` (`project_id`, `project_name` ) VALUES (?, ?)", [projectId, projectName]);
    }

    /**
     * Get all projects from the database
     * @returns {Promise<any[]>} All projects
     */
    public async getProjects() {
        const response = await pool.query("SELECT * FROM `projects`") as Array<any>;
        return response[0];
    }

    /**
     * Insert the stats of a project into the database
     * @param projectId The project id
     * @param downloads The amount of downloads
     * @param follows The amount of followers
     */
    public async insertStats(projectId: string, downloads: number, follows: number, date: Date) {
        await pool.query("INSERT INTO `stats` (`project_id`, `downloads`, `follows`, `date`) VALUES (?, ?, ?, ?)", [projectId, downloads, follows, date]);
    }

    public async getAllStats(days: number) {
        const response = await pool.query("SELECT st.*, (SELECT proj.`project_name` FROM `projects` proj WHERE proj.`project_id` = st.`project_id`) as name FROM `stats` st WHERE `date` > DATE_SUB(NOW(), INTERVAL ? DAY)", [days]) as Array<any>;
        return response[0];
    }
}

let statsTracker: StatisticsTracker | null = null;
export default function getTracker() {
    if (statsTracker === null) {
        statsTracker = new StatisticsTracker();
    }
    return statsTracker;
}