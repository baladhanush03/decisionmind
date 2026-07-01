# Import all the models, so that Base has them before being
# imported by Alembic
from database.base_class import Base  # noqa
from models.user import User  # noqa
from models.dataset import Dataset # noqa
from models.trained_model import TrainedModel # noqa
