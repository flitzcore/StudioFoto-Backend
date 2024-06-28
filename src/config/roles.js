const allRoles = {
  user: ['manageUsers', 'getUsers'],
  admin: ['manageUsers', 'getUsers', 'manageImages', 'manageBookings', 'getBookings'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
