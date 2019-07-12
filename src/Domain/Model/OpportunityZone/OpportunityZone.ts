export default class OpportunityZone {
  constructor(
    private id: number,
    private zip: string,
    private geometry: any,
  ) {

  }

  getId(): number {
    return this.id;
  }

  getZip(): string {
    return this.zip;
  }

  getGeometry(): any {
    return this.geometry;
  }
}
