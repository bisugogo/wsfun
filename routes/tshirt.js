/**
 * Tshirt
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

var Design = require('../models/tshirt.js');
//var Order = require('../models/order.js');

module.exports = function(app) {


  /**
   * Find and retrieves all tshirts
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findAllTshirts = function(req, res) {
    console.log("GET - /tshirts_getAllDesigns");
    return Design.find(function(err, aDesign) {
      if(!err) {
        return res.send({
          status: 'OK',
          designList: aDesign
        });
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
  };



  /**
   * Find and retrieves a single tshirt by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findById = function(sDesignId, res) {

    //console.log("GET - /tshirt/:id");
    return Design.findById(sDesignId, function(err, oDesign) {

      if(!oDesign) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      if(!err) {
        return res.send({ status: 'OK', designDetail:oDesign });
      } else {

        res.statusCode = 500;
        console.log('Internal error(%d): %s', res.statusCode, err.message);
        return res.send({ error: 'Server error' });
      }
    });
  };




  /**
   * Creates a new tshirt from the data request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  createDesign = function(data, res) {

    console.log('POST - /tshirt');

    var design = new Design({
      model:    data.model,
      style:    data.style,
      size :    data.size,
      color:    data.color,
      price:    data.price,
      desc:     data.desc,
      access:   data.access 
    });

    design.save(function(err) {

      if(err) {

        console.log('Error while saving tshirt: ' + err);
        res.send({ error:err });
        return;

      } else {

        console.log("Tshirt created");
        return res.send({ status: 'OK', tshirt:design });

      }

    });

  };

  createOrder = function(data, res) {

    console.log('POST - /tshirt___createOrder');

    var sDesignId = data.designId;

    var oNewOrder = {
      femalePrice: data.femalePrice,
      malePrice: data.malePrice,
      kidPrice: data.kidPrice,
      totalPrice: data.totalPrice,
      maleSize: data.maleSize,
      maleQuantity: data.maleQuantity,
      femaleSize: data.femaleSize,
      femaleQuantity: data.femaleQuantity,
      kidSize: data.kidSize,
      kidQuantity: data.kidQuantity
    };

    Design.findById(sDesignId, function (err, oDesign) {  
      if (!err) {
        console.log('Create order: found target design');
        oDesign.orders.push(oNewOrder);  
        oDesign.save(function (err) {  
        // do something
          if (err) {
            console.log('Create order: save new order error' + err);
            res.send({ error:err });
            return;
          } else {
            console.log("Order created");
            return res.send({ status: 'OK', order:oNewOrder });
          }
        });  
      } else {
        console.log('Create order: target design not found!');
        res.send({ error:err });
        return;
      }
    });
  };



  /**
   * Update a tshirt by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  updateTshirt = function(req, res) {

    console.log("PUT - /tshirt/:id");
    return Design.findById(req.params.id, function(err, tshirt) {

      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      if (req.body.model != null) tshirt.model = req.body.model;
      if (req.body.price != null) tshirt.price = req.body.price;
      if (req.body.style != null) tshirt.style = req.body.style;
      if (req.body.size != null) tshirt.size  = req.body.size;
      if (req.body.colour != null) tshirt.color = req.body.color;

      return tshirt.save(function(err) {
        if(!err) {
          console.log('Updated');
          return res.send({ status: 'OK', tshirt:tshirt });
        } else {
          if(err.name == 'ValidationError') {
            res.statusCode = 400;
            res.send({ error: 'Validation error' });
          } else {
            res.statusCode = 500;
            res.send({ error: 'Server error' });
          }
          console.log('Internal error(%d): %s',res.statusCode,err.message);
        }

        res.send(tshirt);

      });
    });
  };



  /**
   * Delete a tshirt by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  deleteTshirt = function(data, res) {

    console.log("DELETE - /tshirt/");
    return Design.findById(data.designId, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      return tshirt.remove(function(err) {
        if(!err) {
          console.log('Removed tshirt');
          return res.send({ status: 'OK' });
        } else {
          res.statusCode = 500;
          console.log('Internal error(%d): %s',res.statusCode,err.message);
          return res.send({ error: 'Server error' });
        }
      })
    });
  }

  getService = function(req, res) {
    var sAction = req.query.action;
    if (sAction === 'getAllMyDesigns') {
      findAllTshirts(req, res);
    } else if (sAction === 'getMyDesignById') {
      var sDesignId = req.query.designId;
      findById(sDesignId, res);
    }
  };

  postService = function (req, res) {
    var sAction = req.body.action;
    if (sAction && sAction !== '') {
      if (sAction === 'createDesign') {
        createDesign(req.body.data, res);
      } else if (sAction === 'deleteDesign') {
        deleteTshirt(req.body.data, res);
      } else if (sAction === 'createOrder') {
        createOrder(req.body.data, res);
      }
    }
  };

  //Link routes and actions
  app.get('/tshirt', getService);
  //app.get('/tshirt/:id', findById);
  app.post('/tshirt', postService);
  //app.put('/tshirt/:id', updateTshirt);
  //app.delete('/tshirt/:id', deleteTshirt);

}