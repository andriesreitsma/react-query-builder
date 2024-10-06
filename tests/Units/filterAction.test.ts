import {
  clearFiltersAction,
  filterAction,
  removeFilterAction,
} from "@/actions";
import { reverseConflicts } from "@/actions/conflict";
import { FilterOperator, type GlobalState } from "@/types";
import { describe, expect, it } from "@jest/globals";
import { initialState, MockQueryBuilder } from "@tests/Units/utils";

describe("Filter Action test: ", () => {
  it("should add a new filter", () => {
    const result = filterAction(
      "name",
      "Carlos Garcia",
      initialState,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia"],
      },
    ]);
  });

  it("Should update an existing filter", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia"],
        },
      ],
    };

    const result = filterAction(
      "name",
      ["Juan Perez"],
      state,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia", "Juan Perez"],
      },
    ]);
  });

  it("Should be possible to add multiple filter with the same attribute", () => {
    const result = filterAction(
      "name",
      ["Carlos Garcia", "Juan Perez"],
      initialState,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "name",
        value: ["Carlos Garcia", "Juan Perez"],
      },
    ]);
  });

  it("Should possible to remove a filter", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = removeFilterAction(["name"], state, new MockQueryBuilder());

    expect(result.filters).toEqual([
      {
        attribute: "age",
        value: [28],
      },
    ]);
  });

  it("Should possible to remove a filter with alias", () => {
    const state: GlobalState = {
      ...initialState,
      aliases: {
        name: "n",
      },
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = removeFilterAction(["name"], state, new MockQueryBuilder());

    expect(result.filters).toEqual([
      {
        attribute: "age",
        value: [28],
      },
    ]);
  });

  it("Should be possible to remove multiple filters at the same time", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = removeFilterAction(
      ["name", "age"],
      state,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([]);
  });

  it("Should clear all filters at once", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos Garcia", "Juan Perez"],
        },
        {
          attribute: "age",
          value: [28],
        },
      ],
    };

    const result = clearFiltersAction(state, new MockQueryBuilder());

    expect(result.filters).toEqual([]);
  });

  it("Should be possible to add a new filter with an alias", () => {
    const state: GlobalState = {
      ...initialState,
      aliases: {
        user: "u",
      },
      filters: [
        {
          attribute: "user",
          value: ["Carlos"],
        },
      ],
    };

    const result = filterAction(
      "last_name",
      "Garcia",
      state,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "user",
        value: ["Carlos"],
      },
      {
        attribute: "last_name",
        value: ["Garcia"],
      },
    ]);
  });

  it("should remove incompatibles filters when pruneConflictingFilters is present", () => {
    const state: GlobalState = {
      ...initialState,
      pruneConflictingFilters: reverseConflicts({
        date: ["month"],
      }),
      filters: [
        {
          attribute: "date",
          value: ["2024-01-01"],
        },
      ],
    };

    const result = filterAction(
      "month",
      "01",
      state,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "month",
        value: ["01"],
      },
    ]);
  });

  it("should add filter override existing filter when overwrite is true", () => {
    const state: GlobalState = {
      ...initialState,
      filters: [
        {
          attribute: "name",
          value: ["Carlos"],
        },
        {
          attribute: "last_name",
          value: ["Garcia"],
        },
      ],
    } as const;

    const result = filterAction(
      "name",
      ["Juan Perez"],
      state,
      true,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "last_name",
        value: ["Garcia"],
      },
      {
        attribute: "name",
        value: ["Juan Perez"],
      },
    ]);
  });

  it("should add filter with operators", () => {
    const state: GlobalState = {
      ...initialState,
    } as const;

    const resultLessThan = filterAction(
      "age",
      FilterOperator.LessThan,
      state,
      [18],
      new MockQueryBuilder(),
    );

    expect(resultLessThan.filters).toEqual([
      {
        attribute: "age",
        value: [18],
        operator: "<",
      },
    ]);

    const resultGreaterThan = filterAction(
      "age",
      FilterOperator.GreaterThan,
      state,
      [18],
      new MockQueryBuilder(),
    );

    expect(resultGreaterThan.filters).toEqual([
      {
        attribute: "age",
        value: [18],
        operator: ">",
      },
    ]);

    const resultLessEqual = filterAction(
      "age",
      FilterOperator.LessThanOrEqual,
      state,
      [18],
      new MockQueryBuilder(),
    );

    expect(resultLessEqual.filters).toEqual([
      {
        attribute: "age",
        value: [18],
        operator: "<=",
      },
    ]);

    const resultGreaterEqual = filterAction(
      "age",
      FilterOperator.GreaterThanOrEqual,
      state,
      [18],
      new MockQueryBuilder(),
    );

    expect(resultGreaterEqual.filters).toEqual([
      {
        attribute: "age",
        value: [18],
        operator: ">=",
      },
    ]);

    const resultDistinct = filterAction(
      "age",
      FilterOperator.Distinct,
      state,
      [18],
      new MockQueryBuilder(),
    );

    expect(resultDistinct.filters).toEqual([
      {
        attribute: "age",
        value: [18],
        operator: "<>",
      },
    ]);
  });

  it("should not append when filter by operator", () => {
    const state: GlobalState = {
      ...initialState,
    } as const;

    const resultLessThanState = filterAction(
      "age",
      FilterOperator.LessThan,
      state,
      [18],
      new MockQueryBuilder(),
    );

    const resultLessThanEquals = filterAction(
      "age",
      FilterOperator.LessThanOrEqual,
      resultLessThanState,
      [20],
      new MockQueryBuilder(),
    );

    expect(resultLessThanEquals.filters).toEqual([
      {
        attribute: "age",
        value: [20],
        operator: "<=",
      },
    ]);
  });

  it("should work with value as operator sign", () => {
    const state: GlobalState = {
      ...initialState,
    } as const;

    const result = filterAction(
      "condition",
      FilterOperator.LessThan,
      state,
      false,
      new MockQueryBuilder(),
    );

    expect(result.filters).toEqual([
      {
        attribute: "condition",
        value: ["<"],
        operator: undefined,
      },
    ]);
  });
});
