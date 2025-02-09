import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const formData = Array.isArray(req.body) ? req.body : [req.body];

    // data structure by company
    const companyData = {};

    formData.forEach((item) => {
      const {
        identifier,
        name,
        year,
        assets,
        liabilities,
        equity,
        income,
        revenue,
        profit,
        operatingIncome,
        netIncome,
        interestExpense,
        incomeTaxes,
        depreciation,
        amortization,
      } = item;

      // object creation by company
      if (!companyData[name]) {
        companyData[name] = {
          name,
          balanceSheet: {
            years: [],
            categories: [
              "Current Assets",
              "Inventories",
              "Non-Current Assets",
              "Current Liabilities",
              "Non-Current Liabilities",
              "Common Stock",
              "Retained Earnings",
            ],
            values: {
              "Current Assets": [],
              "Inventories": [],
              "Non-Current Assets": [],
              "Current Liabilities": [],
              "Non-Current Liabilities": [],
              "Common Stock": [],
              "Retained Earnings": [],
            },
          },
          incomeStatement: {
            years: [],
            categories: [
              "Net Income",
              "Cost",
              "Revenue",
              "Interest Expenses",
              "Income Taxes",
              "Depreciation",
              "Amortization",
            ],
            values: {
              "Net Income": [],
              "Cost": [],
              "Revenue": [],
              "Interest Expenses": [],
              "Income Taxes": [],
              "Depreciation": [],
              "Amortization": [],
            },
          },
        };
      }

      // year addition (duplicate prevention)
      if (!companyData[name].balanceSheet.years.includes(year)) {
        companyData[name].balanceSheet.years.push(year);
        companyData[name].incomeStatement.years.push(year);
      }

      // value addition
      companyData[name].balanceSheet.values["Current Assets"].push(
        assets.current["Cash and cash equivalents"] +
          assets.current["Receivables, net"] +
          assets.current["Inventories"] +
          assets.current["Etc."]
      );

      companyData[name].balanceSheet.values["Inventories"].push(
        assets.current["Inventories"]
      );

      companyData[name].balanceSheet.values["Non-Current Assets"].push(
        assets.nonCurrent["Property and equipment, net"] +
          assets.nonCurrent["Goodwill"] +
          assets.nonCurrent["Long-term lease assets"] +
          assets.nonCurrent["Etc."]
      );

      companyData[name].balanceSheet.values["Current Liabilities"].push(
        liabilities.current["Short-term borrowings"] +
          liabilities.current["Accounts payable"] +
          liabilities.current["Accrued liabilities"] +
          liabilities.current["Etc."]
      );

      companyData[name].balanceSheet.values["Non-Current Liabilities"].push(
        liabilities.longTerm["Long-term debt"] +
          liabilities.longTerm["Deferred income taxes"] +
          liabilities.longTerm["Finance & operating lease obligations"] +
          liabilities.longTerm["Etc."]
      );

      companyData[name].balanceSheet.values["Common Stock"].push(
        equity.common["Common stock"] +
          equity.common["Capital in excess of par value"] +
          equity.common["Etc."]
      );

      companyData[name].balanceSheet.values["Retained Earnings"].push(
        equity.common["Retained earnings"]
      );

      // Income Statement
      companyData[name].incomeStatement.values["Net Income"].push(netIncome);
      companyData[name].incomeStatement.values["Cost"].push(profit);
      companyData[name].incomeStatement.values["Revenue"].push(revenue);
      companyData[name].incomeStatement.values["Interest Expenses"].push(
        interestExpense
      );
      companyData[name].incomeStatement.values["Income Taxes"].push(
        incomeTaxes
      );
      companyData[name].incomeStatement.values["Depreciation"].push(
        depreciation
      );
      companyData[name].incomeStatement.values["Amortization"].push(
        amortization
      );
    });

    res.status(200).json(Object.values(companyData));
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ message: "Error processing data" });
  }
});

export default router;
