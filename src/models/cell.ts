
class Cell {

 public ordinal: number;
 public value: string | number | null; 
 public formatString: string;
 public formattedValue: string;
 public updateable: number;
 public ruleDerived: boolean;
 public annotated: boolean;
 public consolidated: boolean;
 public nullIntersected: boolean;
 public hasPicklist: boolean;
 public picklistValues: string;
 public hasDrillthrough: boolean;
 
  constructor(
    ordinal: number,
    value: string | number | null,
    formatString: string,
    formattedValue: string,
    updateable: number,
    ruleDerived: boolean,
    annotated: boolean,
    consolidated: boolean,
    nullIntersected: boolean,
    hasPicklist: boolean,
    picklistValues: string,
    hasDrillthrough: boolean) {
  this.ordinal = ordinal;
  this.value = value;
  this.formatString = formatString;
  this.formattedValue = formattedValue;
  this.updateable = updateable;
  this.ruleDerived = ruleDerived;
  this.annotated = annotated;
  this.consolidated = consolidated;
  this.nullIntersected = nullIntersected;
  this.hasPicklist = hasPicklist;
  this.picklistValues = picklistValues;
  this.hasDrillthrough = hasDrillthrough;
  }

  static fromJson(data: any): Cell {
    return new Cell(
      data.Ordinal,
      data.Value,
      data.FormatString,
      data.FormattedValue,
      data.Updateable,
      data.RuleDerived,
      data.Annotated,
      data.Consolidated,
      data.NullIntersected,
      data.HasPicklist,
      data.PicklistValues,
      data.HasDrillthrough
    )
  }
}

export default Cell;