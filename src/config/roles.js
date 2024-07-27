const allRoles = {
  user: ['manageUsers', 'getUsers'],
  admin: ['manageUsers', 'getUsers', 'manageImages', 'manageBookings', 'getBookings', 'manageServices'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
