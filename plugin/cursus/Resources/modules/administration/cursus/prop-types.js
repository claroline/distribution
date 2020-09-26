import {PropTypes as T} from 'prop-types'

import {
  Group as GroupType,
  Role as RoleType,
  User as UserType
} from '#/main/core/user/prop-types'
import {Workspace as WorkspaceType} from '#/main/core/workspace/prop-types'

import {constants} from '#/plugin/cursus/constants'

const Course = {
  propTypes: {
    id: T.string,
    code: T.string,
    title: T.string,
    description: T.string,
    meta: T.shape({
      workspace: T.shape(WorkspaceType.propTypes),
      workspaceModel: T.shape(WorkspaceType.propTypes),
      tutorRoleName: T.string,
      learnerRoleName: T.string,
      icon: T.string,
      defaultSessionDuration: T.number,
      order: T.number
    }),
    restrictions: T.shape({
      users: T.number
    }),
    registration: T.shape({
      selfRegistration: T.bool,
      selfUnregistration: T.bool,
      validation: T.bool,
      userValidation: T.bool
    })
  },
  defaultProps: {
    meta: {
      order: constants.DEFAULT_ORDER
    },
    registration: {
      selfRegistration: false,
      selfUnregistration: false,
      validation: false,
      userValidation: false
    }
  }
}

const Session = {
  propTypes: {
    id: T.string,
    code: T.string,
    name: T.string,
    description: T.string,
    meta: T.shape({
      default: T.bool,

      type: T.number,
      course: T.shape(Course.propTypes),
      workspace: T.shape(WorkspaceType.propTypes),
      tutorRole: T.shape(RoleType.propTypes),
      learnerRole: T.shape(RoleType.propTypes),
      creationDate: T.string,
      order: T.number,
      color: T.string,
      certificated: T.bool
    }),
    restrictions: T.shape({
      users: T.number,
      dates: T.arrayOf(T.string)
    }),
    registration: T.shape({
      selfRegistration: T.bool,
      selfUnregistration: T.bool,
      validation: T.bool,
      userValidation: T.bool,
      eventRegistrationType: T.number
    })
  },
  defaultProps: {
    name: '',
    meta: {
      default: false,
      order: constants.DEFAULT_ORDER,
      certificated: true
    },
    registration: {
      selfRegistration: false,
      selfUnregistration: false,
      validation: false,
      userValidation: false,
      eventRegistrationType: constants.REGISTRATION_AUTO
    }
  }
}

const SessionEvent = {
  propTypes: {
    id: T.string,
    code: T.string,
    name: T.string,
    description: T.string,
    meta: T.shape({
      type: T.number,
      session: T.shape(Session.propTypes),
      set: T.string
    }),
    restrictions: T.shape({
      users: T.number,
      dates: T.arrayOf(T.string)
    }),
    registration: T.shape({
      registrationType: T.number
    })
  },
  defaultProps: {
    name: '',
    registration: {
      registrationType: constants.REGISTRATION_AUTO
    }
  }
}

const CursusUser = {
  propTypes: {
    id: T.string.isRequired,
    cursus: T.shape({}).isRequired,
    user: T.shape(UserType.propTypes).isRequired,
    type: T.number.isRequired,
    registrationDate: T.string.isRequired
  }
}

const CursusGroup = {
  propTypes: {
    id: T.string.isRequired,
    cursus: T.shape({}).isRequired,
    group: T.shape(GroupType.propTypes).isRequired,
    type: T.number.isRequired,
    registrationDate: T.string.isRequired
  }
}

const SessionUser = {
  propTypes: {
    id: T.string.isRequired,
    session: T.shape(Session.propTypes).isRequired,
    user: T.shape(UserType.propTypes).isRequired,
    type: T.number.isRequired,
    registrationDate: T.string.isRequired
  }
}

const SessionGroup = {
  propTypes: {
    id: T.string.isRequired,
    session: T.shape(Session.propTypes).isRequired,
    group: T.shape(GroupType.propTypes).isRequired,
    type: T.number.isRequired,
    registrationDate: T.string.isRequired
  }
}

const SessionEventUser = {
  propTypes: {
    id: T.string.isRequired,
    sessionEvent: T.shape(SessionEvent.propTypes).isRequired,
    user: T.shape(UserType.propTypes).isRequired,
    registrationStatus: T.number.isRequired,
    registrationDate: T.string,
    applicationDate: T.string
  }
}

const CourseQueue = {
  propTypes: {
    id: T.string.isRequired,
    course: T.shape(Course.propTypes).isRequired,
    user: T.shape(UserType.propTypes).isRequired,
    status: T.number.isRequired,
    applicationDate: T.string.isRequired
  }
}

const SessionQueue = {
  propTypes: {
    id: T.string.isRequired,
    session: T.shape(Session.propTypes).isRequired,
    user: T.shape(UserType.propTypes).isRequired,
    status: T.number.isRequired,
    applicationDate: T.string.isRequired
  }
}

export {
  Course,
  Session,
  SessionEvent,
  CursusUser,
  CursusGroup,
  SessionUser,
  SessionGroup,
  SessionEventUser,
  CourseQueue,
  SessionQueue
}