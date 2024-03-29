const bcrypt = require("bcryptjs");
const Event = require("../../models/events");
const User = require("../../models/users");
const Booking = require("../../models/booking");

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          creator: user.bind(this, event.creator),
          date: new Date(event._doc.date).toISOString()
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator)
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            creator: user.bind(this, event._doc.creator),
            date: new Date(event._doc.date).toISOString()
          };
        });
      })
      .catch(err => console.log(err));
  },

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (err) {
      console.log("Error with the booking");
      throw err;
    }
  },

  createEvent: args => {
    let createdEvent;
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5db1803e9ed37a1ee121420f"
    });
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator),
          date: new Date(result._doc.date).toISOString()
        };
        return User.findById("5db1803e9ed37a1ee121420f");
      })
      .then(user => {
        if (!user) {
          throw new Error("User not found");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(() => {
        return createdEvent;
      })
      .catch(err => console.log(err));
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User exists already");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null };
      })
      .catch(err => console.log(err));
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5db1803e9ed37a1ee121420f",
      event: fetchedEvent
    });

    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.createdAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  }
};
