
const Sauce = require("../models/sauce");

const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}


exports.createSauce = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    req.body.sauce = JSON.parse(req.body.sauce);



    const newSauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    // Salva la nuova salsa nel database
    newSauce.save()
        .then(() => {
            res.status(201).json({ message: 'Salsa creata con successo!' });
        })
        .catch((error) => {
            res.status(400).json({ error: error });
        });
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then(
        (sauce) => {

            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink('images/' + filename, () => {
                Sauce.deleteOne({_id: req.params.id}).then(
                    () => {
                        res.status(200).json({
                            message: 'Deleted!'
                        });
                    }
                ).catch(
                    (error) => {
                        res.status(400).json({
                            error: error
                        });
                    }
                );
            });
        }
    );
};



exports.modifySauce = (req, res, next) => {
    const sauce = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body}
    Sauce.updateOne({_id: req.params.id}, {...sauce, _id: req.params.id})
        .then(sauce => res.status(200).json({ message: 'object modified'}))
        .catch(err => res.status(400).json({ err }))
}



exports.likeSauce = (req, res, next) =>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
            if(req.body.like == 1){ //if liked
                sauce.likes += 1;
                sauce.usersLiked.push(req.body.userId);
                sauce.save()
            }
            else if(req.body.like == -1){ //if disliked
                sauce.dislikes += 1;
                sauce.usersDisliked.push(req.body.userId);
                sauce.save()
            }
            else if(req.body.like == 0){ //if  unliked or undisliked
                let likeIndex = sauce.usersLiked.indexOf(req.body.userId);
                let dislikeIndex = sauce.usersDisliked.indexOf(req.body.userId);

                if(likeIndex >-1){
                    sauce.likes -= 1;
                    sauce.usersLiked.splice(likeIndex, 1)
                } else if(dislikeIndex > -1){
                    sauce.dislikes -= 1;
                    sauce.usersDisliked.splice(dislikeIndex, 1)
                }
                sauce.save()
            }
        })
        .then((response) => res.status(201).json({ response }))
        .catch(err => res.status(400).json({ err }))
}
