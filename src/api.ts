import { APIDate, APIRecord } from "./types";

export async function fetchData(date: Date): Promise<APIRecord[]> {
  const response = await fetch(
    `https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date=${date
      .toISOString()
      .slice(0, 10)}&rows=30`
  );
  const json = await response.json();
  return json.records;
}

export async function fetchDates(): Promise<Date[]> {
  const response = await fetch(
    "https://www.odwb.be/api/records/1.0/analyze/?dataset=points-verts-de-ladeps&x=date&y.walks_count.expr=id&y.walks_count.func=COUNT"
  );
  const json = await response.json();
  return json.map(
    (date: APIDate) =>
      new Date(Date.UTC(date.x.year, date.x.month - 1, date.x.day))
  );
}
