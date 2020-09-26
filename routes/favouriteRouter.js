const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourite');
const Dishes = require('../models/dishes');

const favouriteRouter = express.Router(); 
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (res, req, next) => {
    Favourites.findOne({ user: req.user._id }, (err, favourite) => {
        if (err) {
            return next(err);
        }
        if (!favourite) {
            res.statusCode = 403;
            res.end('No favourites for you!');
        }
    })
    .populate('user')
    .populate('dishes')
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    }, (err) => next(err)
    );
})

.put(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favourites');
})

.post(cors.corsWithOptions,authenticate.verifyUser, (res, req, next) => {
    Favourites.findOne({ user: req.user._id })
		.then((favorite) => {
			if (favorite == null) {
                Favorites.create()
                .then((favorite) => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						for (const i in req.body) {
							favorite.dishes.push(req.body[i]);
						}
						favorite.save();
						res.json(favorite);
					}, (err) => next(err)
				);
            } 
            else {
				for (const i in req.body) {
                    Favorites.findOne({ user: newFavorite.user })
                    .then((oldFavorite) => {
						if (oldFavorite == null) {
							favorite.dishes.push(req.body[i]);
						}
                    }
                );
			}
			favorite.save();
            res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.json(favorite);
		}
	})
	.catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favourites.remove({})
    .then((resp) => {
        res.statusCode = 403; 
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favouriteRouter.route('/:favouriteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.get(cors.cors, authenticate.verifyUser, (res, req, next) => {
    Favourites.findById(req.params.favouriteId)
    .then((favourite) => {
        if (!favourite.user.equals(req.user._id)) {
            var err = new Error('You are unauthorized to perform this operation!');
            err.status = 403; 
            return next(err); 
        }
        res.statusCode=200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err))

})

.put(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favourites.findByIdAndUpdate(req.params.favouriteId, 
        { $set: req.body }, { new: true })
    .then((favourite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourite);
    }, (err) => next(err))
    .catch((err) => next(err))
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
    Favourites.findOne({ user: req.user._id })
    .then((favorite) => {
        favorite.dishes.remove(req.params.favouriteId);
        favorite.save()
        .then((favorite)=> {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite)
        }, (err)=> next(err))
    })
    .catch((err) => next(err))
})

module.exports = favouriteRouter;