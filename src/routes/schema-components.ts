/**
 * @openapi
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         id:   { type: string }
 *         firstName: { type: string }
 *         lastName:  { type: string }
 *         dateOfBirth: { type: string, format: date }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *         user:
 *           type: object
 *           nullable: true
 *           properties:
 *             personId: { type: string }
 *             email:    { type: string }
 *         activities:
 *           type: array
 *           items: { $ref: '#/components/schemas/Activity' }
 *         userConstraints:
 *           type: array
 *           items: { $ref: '#/components/schemas/UserConstraint' }
 *
 *     User:
 *       type: object
 *       properties:
 *         personId:  { type: string }
 *         email:     { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         person:    { $ref: '#/components/schemas/Person' }
 *         userRoles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               roleId: { type: string }
 *               role:   { $ref: '#/components/schemas/Role' }
 *
 *     Role:
 *       type: object
 *       properties:
 *         id:   { type: string }
 *         name: { type: string }
 *
 *     Doctor:
 *       type: object
 *       properties:
 *         personId: { type: string }
 *         rizivNumber: { type: string }
 *         isEnabledInShifts: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         person:
 *           type: object
 *           properties:
 *             id: { type: string }
 *             firstName: { type: string }
 *             lastName: { type: string }
 *             dateOfBirth: { type: string, format: date }
 *             user:
 *               type: object
 *               nullable: true
 *               properties:
 *                 personId: { type: string }
 *                 email: { type: string }
 *
 *     DoctorRequestBody:
 *       type: object
 *       required: [personId, rizivNumber]
 *       properties:
 *         personId: 
 *           type: string
 *           description: The person ID to link to this doctor
 *         rizivNumber: 
 *           type: string
 *           description: Belgian RIZIV number (11 characters)
 *         isEnabledInShifts: 
 *           type: boolean
 *           description: Whether the doctor is enabled for shift planning
 *           default: true
 *
 *     Activity:
 *       type: object
 *       properties:
 *         id:           { type: string }
 *         activityType: { type: string }
 *         start:        { type: string, format: date-time }
 *         end:          { type: string, format: date-time }
 *         status:
 *           type: string
 *           description: Status of the activity (SCHEDULED, COMPLETED, CANCELLED, etc.)
 *         personId:   { type: string }
 *         shiftTypeId: { type: string, nullable: true }
 *         createdAt:  { type: string, format: date-time }
 *         updatedAt:  { type: string, format: date-time }
 *         person:
 *           type: object
 *           properties:
 *             id:        { type: string }
 *             firstName: { type: string }
 *             lastName:  { type: string }
 *         shiftType:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:   { type: string }
 *             name: { type: string }
 *             startHour:       { type: integer }
 *             startMinute:     { type: integer }
 *             durationMinutes: { type: integer }
 *
 *     ActivityRequestBody:
 *       type: object
 *       required: [activityType, start, end, personId]
 *       properties:
 *         activityType: { type: string }
 *         start:        { type: string, format: date-time }
 *         end:          { type: string, format: date-time }
 *         personId:     { type: string }
 *         shiftTypeId:  { type: string }
 *         status:
 *           type: string
 *           description: Status of the activity (SCHEDULED, COMPLETED, CANCELLED, etc.)
 *           default: SCHEDULED
 *
 *     ShiftType:
 *       type: object
 *       properties:
 *         id:   { type: string }
 *         name: { type: string }
 *         startHour:       { type: integer }
 *         startMinute:     { type: integer }
 *         durationMinutes: { type: integer }
 *         activeFrom:  { type: string, format: date-time, nullable: true }
 *         activeUntil: { type: string, format: date-time, nullable: true }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *         rates:
 *           type: array
 *           items: { $ref: '#/components/schemas/ShiftTypeRate' }
 *
 *     ShiftTypeRate:
 *       type: object
 *       properties:
 *         id:          { type: string }
 *         shiftTypeId: { type: string }
 *         rate:        { type: number, format: float }
 *         validFrom:   { type: string, format: date-time }
 *         validUntil:  { type: string, format: date-time, nullable: true }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *
 *     Roster:
 *       type: object
 *       properties:
 *         id:          { type: integer }
 *         shiftTypeId: { type: string }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *         shiftType:
 *           type: object
 *           properties:
 *             id:              { type: string }
 *             name:            { type: string }
 *             startHour:       { type: integer }
 *             startMinute:     { type: integer }
 *             durationMinutes: { type: integer }
 *
 *     UserConstraint:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         personId: { type: string }
 *         maxNightShiftsPerWeek:     { type: integer, nullable: true }
 *         maxConsecutiveNightShifts: { type: integer, nullable: true }
 *         minRestHoursBetweenShifts: { type: integer, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         person:
 *           type: object
 *           properties:
 *             id:        { type: string }
 *             firstName: { type: string }
 *             lastName:  { type: string }
 *
 *     AdminPersonResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         dateOfBirth: { type: string, format: date }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         doctor:
 *           $ref: '#/components/schemas/Doctor'
 *           nullable: true
 *
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         personId: { type: string }
 *         email:    { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         userRoles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               roleId: { type: string }
 *               role:   { $ref: '#/components/schemas/Role' }
 *         person:   { $ref: '#/components/schemas/AdminPersonResponse' }
 *
 *     AuthUserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful.
 *         authenticatedUser:
 *           type: object
 *           properties:
 *             personId:
 *               type: string
 *             email:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *               format: date
 *
 *     PersonRequestBody:
 *       type: object
 *       required: [firstName, lastName, dateOfBirth]
 *       properties:
 *         firstName:
 *           type: string
 *           description: The person's first name
 *         lastName:
 *           type: string
 *           description: The person's last name
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The person's date of birth
 *
 *     PersonResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         dateOfBirth: { type: string, format: date }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         user:
 *           type: object
 *           nullable: true
 *           properties:
 *             personId: { type: string }
 *             email: { type: string }
 *         activities:
 *           type: array
 *           items: { $ref: '#/components/schemas/Activity' }
 *         userConstraints:
 *           type: array
 *           items: { $ref: '#/components/schemas/UserConstraint' }
 *
 *     SimplePersonResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         dateOfBirth: { type: string, format: date }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *   responses:
 *     NotFound:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error: { type: string }
 *
 *     ValidationError:
 *       description: Request validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error: { type: string }
 *
 *     Unauthorized:
 *       description: Authentication information is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error: { type: string }
 *
 *     Forbidden:
 *       description: Access to the requested resource is forbidden
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error: { type: string }
 */
