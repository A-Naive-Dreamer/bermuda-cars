const { Inventory, Sales } = require("../../db/models");
const Sequelize = require("sequelize");
const db = require("../../db/models");

module.exports = {
  getGross: (req, res) => {
    try {
      db.sequelize
        .query(
          "SELECT sale.itemId, inventory.item, sale.sold, sale.unsold, inventory.profit, inventory.totalCost, inventory.color,  sale.month, sale.year, (inventory.profit * sale.sold) as profitTotal, (inventory.totalCost * sale.unsold) as totalLoss  FROM Sales AS sale JOIN Inventories AS inventory ON sale.itemId = inventory.id",
          { type: Sequelize.QueryTypes.SELECT }
        )
        .then(result => {
          console.log(result);

          res.status(200).send({
            message: "Get all datas.",
            data: result
          });
        })
        .catch(error => console.log(error));
    } catch (error) {
      console.log(error);
    }
  },
  getYears: (req, res) => {
    db.sequelize
      .query(
        "SELECT DISTINCT year from Sales;",
        {
          type: Sequelize.QueryTypes.SELECT
        }
      )
      .then(result => {
        res.status(200).send({
          message: "Get all years.",
          data: result
        })
      })
      .catch(error => {
        console.log(error)
      })
  },
  getMonths: (req, res) => {
    db.sequelize
      .query(
        "SELECT DISTINCT CONCAT(month, ' ', year) AS date, month, year FROM Sales",
        {
          type: Sequelize.QueryTypes.SELECT
        })
      .then(async result => {
        res.status(200).send({
          message: "Get all months.",
          data: result
        })
      })
  },
  getRevenueReports: async (req, res) => {
    try {
      let months = await db.sequelize
        .query(
          "SELECT DISTINCT month from Sales WHERE year=" + req.params.year + ";",
          {
            type: Sequelize.QueryTypes.SELECT
          })

      let rows = []

      for (let x = 0; x < months.length; ++x) {
        let row = await db.sequelize
          .query(
            "SELECT Sales.month, Sales.year, SUM(Inventories.profit * Sales.sold) as profitTotal, SUM(Inventories.totalCost * Sales.unsold) as totalLoss  FROM Sales JOIN Inventories ON Sales.itemId = Inventories.id WHERE Sales.month='" + months[x].month + "' AND year=" + req.params.year + ";",
            { type: Sequelize.QueryTypes.SELECT }
          )

        rows.push(...row)
      }

      res.status(200).send({
        data: rows
      })
    } catch (error) {
      console.log(error);
    }
  },

  getSaleReports: (req, res) => {
    db.sequelize
      .query(
        "SELECT Inventories.item, Inventories.color, Sales.sold, Sales.unsold FROM Sales JOIN Inventories ON Sales.itemId = Inventories.id WHERE Sales.year=" + req.params.year + " AND Sales.month='" + req.params.month + "';",
        {
          type: Sequelize.QueryTypes.SELECT
        }
      )
      .then(result => {
        res.status(200).send({
          message: 'Get all sale reports.',
          data: result
        })
      })
  },

  addOne: async (req, res) => {
    try {
      if (
        !(
          req.user.role === 'Admin' ||
          req.user.role === 'Executive' ||
          req.user.role === 'Employee'
        )
      ) {
        res.send({
          message: 'ordinary user cant edit this data'
        })
        return null
      }

      await Sales
        .create({
          itemId: parseInt(req.params.itemId),
          month: req.body.month,
          year: parseInt(req.body.year),
          sold: parseInt(req.body.sold),
          unsold: parseInt(req.body.unsold),
        })
        .then(result => {
          Sales
            .findAll({})
            .then(result2 => {
              res.send({
                message: 'Data is successfully added.',
                data: result2
              })
            })
        })
    } catch (error) {
      console.log(error);
    }
  },


  deleteOne: async (req, res) => {
    try {
      if (!(
        req.user.role === 'Admin' ||
        req.user.role === 'Executive')
      ) {
        res.send({
          message: 'ordinary user cant edit this data'
        })
        return null
      }
      await Sales
        .destroy({
          where: {
            id: parseInt(req.params.id),
          }
        }).then(result => {
          Sales
            .findAll({})
            .then(result2 => {
              res.send({
                message: 'Data is successfully deleted.',
                data: result2
              })
            })
        })
    } catch (error) {
      console.log(error);
    }
  },

  updateOne: async (req, res) => {
    try {
      if (
        !(
          req.user.role === 'Admin' ||
          req.user.role === 'Executive'
        )
      ) {
        res.send({
          message: 'ordinary user cant edit this data'
        })
        return null
      }
      await Sales
        .update(
          {
            month: req.body.month,
            year: parseInt(req.body.year),
            sold: parseInt(req.body.sold),
            unsold: parseInt(req.body.unsold),
          },
          {
            where: {
              id: parseInt(req.params.id)
            }
          })
        .then(result => {
          Sales
            .findAll({})
            .then(result2 => {
              res.send({
                message: 'Data is successfully updated.',
                data: result2
              })
            })
        })
    } catch (error) {
      console.log(error);
    }
  },
};
