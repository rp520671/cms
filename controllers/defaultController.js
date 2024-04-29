const Post = require('../models/PostModel').Post;
const Category = require('../models/CategoryModel').Category;
const Comment = require('../models/CommentModel').Comment;
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel').User;

module.exports = {

    index: async (req, res) => {
        try {
            const posts = await Post.find();
            const categories = await Category.find();
            res.render('default/index', {posts: posts, categories: categories});
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    /* LOGIN ROUTES */
    loginGet: (req, res) => {
        res.render('default/login', {message: req.flash('error')});
    },

    loginPost: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });

            if (!user) {
                req.flash('error-message', 'Invalid email or password');
                return res.redirect('/login');
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                req.flash('error-message', 'Invalid email or password');
                return res.redirect('/login');
            }

            // Log the user in
            req.session.user = user;
            req.flash('success-message', 'Logged in successfully');
            res.redirect('/'); // Redirect to homepage after successful login
        } catch (error) {
            console.error(error);
            req.flash('error-message', 'An error occurred. Please try again later.');
            res.redirect('/login');
        }
    },

    /* REGISTER ROUTES*/

    registerGet: (req, res) => {
        res.render('default/register');
    },

    registerPost: (req, res) => {
        let errors = [];

        if (!req.body.firstName) {
            errors.push({message: 'First name is mandatory'});
        }
        if (!req.body.lastName) {
            errors.push({message: 'Last name is mandatory'});
        }
        if (!req.body.email) {
            errors.push({message: 'Email field is mandatory'});
        }
        if (!req.body.password || !req.body.passwordConfirm) {
            errors.push({message: 'Password field is mandatory'});
        }
        if (req.body.password !== req.body.passwordConfirm) {
            errors.push({message: 'Passwords do not match'});
        }

        if (errors.length > 0) {
            res.render('default/register', {
                errors: errors,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email
            });
        } else {
            User.findOne({email: req.body.email}).then(user => {
                if (user) {
                    req.flash('error-message', 'Email already exists, try to login.');
                    res.redirect('/login');
                } else {
                    const newUser = new User(req.body);

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            newUser.password = hash;
                            newUser.save().then(user => {
                                req.flash('success-message', 'You are now registered');
                                res.redirect('/login');
                            });
                        });
                    });
                }
            });
        }
    },

    getSinglePost: (req, res) => {
        const id = req.params.id;

        Post.findById(id)
            .populate({path: 'comments', populate: {path: 'user', model: 'user'}})
            .then(post => {
                if (!post) {
                    res.status(404).json({message: 'No Post Found'});
                }
                else {
                    res.render('default/singlePost', {post: post, comments: post.comments});
                }
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Internal Server Error');
            });
    },

    submitComment: (req, res) => {

        if (req.user) {
            Post.findById(req.body.id).then(post => {
                const newComment = new Comment({
                    user: req.user.id,
                    body: req.body.comment_body
                });

                post.comments.push(newComment);
                post.save().then(savedPost => {
                    newComment.save().then(savedComment => {
                        req.flash('success-message', 'Your comment was submitted for review.');
                        res.redirect(`/post/${post._id}`);
                    });
                });
            }).catch(error => {
                console.error(error);
                req.flash('error-message', 'An error occurred. Please try again later.');
                res.redirect('/');
            });
        } else {
            req.flash('error-message', 'Login first to comment');
            res.redirect('/login');
        }
    }
};
