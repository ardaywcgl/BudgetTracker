// src/utils/helpers.js

/**
 * Request'ten kullanıcı ID'sini alır
 * @param {Object} req - Express request object
 * @returns {number|null} - Kullanıcı ID'si veya null
 */
function getUserId(req) {
  return (
    (req.user && (req.user.id || req.user.userId)) ||
    req.userId ||
    null
  );
}

module.exports = {
  getUserId,
};

