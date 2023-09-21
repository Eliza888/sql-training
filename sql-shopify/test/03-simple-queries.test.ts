import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Simple Queries", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("02", "03");
    }, minutes(1));

    it("should select app count with a rating of 5 stars", async (done) => {
        const query = `
            SELECT COUNT(*) AS count
            FROM apps
            WHERE rating = 5;
        `;
        const result = await db.selectSingleRow(query);
        expect(result).toEqual({
            count: 731,
        });
        done();
    }, minutes(1));

    it("should select top 3 developers with the most apps published", async done => {
        const query = `SELECT developer, COUNT(*) as count
                       FROM apps
                       GROUP BY developer
                       ORDER BY COUNT(*) DESC
                       LIMIT 3`;
    
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { developer: "Webkul Software Pvt Ltd", count: 30 },
            { developer: "POWr.io", count: 25 },
            { developer: "SpurIT", count: 24 },
        ]);
        done();
    }, minutes(1));
              
    it("should select count of reviews created in years 2014, 2015, and 2016", async (done) => {
        const query = `
        Select SUBSTR(date_created,7) as year, Count(*) as review_count
        From reviews
        Where year BETWEEN '2014' and '2016'
        Group by year       
        `;
        const result = await db.selectMultipleRows(query);
        expect(result).toEqual([
            { year: "2014", review_count: 6157 },
            { year: "2015", review_count: 9256 },
            { year: "2016", review_count: 37860 },
        ]);
        done();
    }, minutes(1));
});             