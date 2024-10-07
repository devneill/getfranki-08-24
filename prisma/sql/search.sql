-- @param {String} $1:like
-- @param {String} $2:categoryFilter
SELECT
   User.id,
   User.username,
   User.name,
   User.about,
   UserImage.id AS imageId,
   GROUP_CONCAT(DISTINCT C.name) AS categories,
   r.name as role
FROM User
LEFT JOIN UserImage ON User.id = UserImage.userId
JOIN _RoleToUser ru ON User.id = ru.b
JOIN Role r ON ru.a = r.id
JOIN _CategoryToUser cu ON User.id = cu.b
JOIN Category c ON cu.a = c.id
WHERE role LIKE "supplier"
AND (User.username LIKE :like OR User.name LIKE :like)
AND C.name LIKE :categoryFilter
GROUP BY User.id
ORDER BY (
    SELECT Event.updatedAt
	FROM Event
	WHERE Event.ownerId = User.id
	ORDER BY Event.updatedAt DESC
	LIMIT 1
) DESC
LIMIT 50
